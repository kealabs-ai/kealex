import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.join(projectRoot, 'src')
const methods = new Set(['get', 'post', 'put', 'patch', 'delete'])
const sourceFiles = []

function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) collectSourceFiles(file)
    else if (/\.tsx?$/.test(entry.name)) sourceFiles.push(file)
  }
}

function enclosingFunctionVariable(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
      const declaration = current.parent
      if (ts.isVariableDeclaration(declaration) && ts.isIdentifier(declaration.name)) {
        return declaration.name.text
      }
    }
    if (ts.isSourceFile(current)) break
  }
  return null
}

function expandString(node, constants) {
  if (!node) return ['{}']
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text]
  if (ts.isIdentifier(node)) return [constants.get(node.text) ?? '{}']
  if (ts.isConditionalExpression(node)) {
    return [...expandString(node.whenTrue, constants), ...expandString(node.whenFalse, constants)]
  }
  if (ts.isTemplateExpression(node)) {
    let values = [node.head.text]
    for (const span of node.templateSpans) {
      const expressions = expandString(span.expression, constants)
      values = values.flatMap((prefix) => expressions.map((value) => `${prefix}${value}${span.literal.text}`))
    }
    return values
  }
  return ['{}']
}

collectSourceFiles(sourceRoot)
const routeSites = []
const unresolved = []

for (const file of sourceFiles) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const constants = new Map()
  const wrapperMethods = new Map()

  function collectHelpers(node) {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.initializer
      && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))
    ) {
      constants.set(node.name.text, node.initializer.text)
    }

    if (
      ts.isCallExpression(node)
      && ts.isPropertyAccessExpression(node.expression)
      && ts.isIdentifier(node.expression.expression)
      && node.expression.expression.text === 'api'
      && methods.has(node.expression.name.text)
      && node.arguments[0]
      && ts.isIdentifier(node.arguments[0])
    ) {
      const helper = enclosingFunctionVariable(node)
      if (helper) wrapperMethods.set(helper, node.expression.name.text.toUpperCase())
    }

    ts.forEachChild(node, collectHelpers)
  }
  collectHelpers(source)

  function addRoute(method, argument, node) {
    const start = source.getLineAndCharacterOfPosition(node.getStart())
    const fileName = path.relative(projectRoot, file).replaceAll(path.sep, '/')
    const variants = expandString(argument, constants)
    if (!argument) unresolved.push(`${fileName}:${start.line + 1} ${method} has no path argument`)
    for (const route of variants) {
      routeSites.push({
        method,
        path: route.replace(/\{[^}]+\}/g, '{}'),
        file: fileName,
        line: start.line + 1,
      })
    }
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      if (
        ts.isPropertyAccessExpression(node.expression)
        && ts.isIdentifier(node.expression.expression)
        && node.expression.expression.text === 'api'
        && methods.has(node.expression.name.text)
      ) {
        const argument = node.arguments[0]
        // Generic helper implementations accept a path parameter; their concrete callers are expanded below.
        const helper = enclosingFunctionVariable(node)
        if (!(argument && ts.isIdentifier(argument) && wrapperMethods.has(helper))) {
          if (argument && ts.isIdentifier(argument) && !constants.has(argument.text)) {
            const start = source.getLineAndCharacterOfPosition(node.getStart())
            unresolved.push(`${path.relative(projectRoot, file).replaceAll(path.sep, '/')}:${start.line + 1} ${node.expression.name.text.toUpperCase()} uses unresolved path variable ${argument.text}`)
          }
          addRoute(node.expression.name.text.toUpperCase(), argument, node)
        }
      } else if (ts.isIdentifier(node.expression) && wrapperMethods.has(node.expression.text)) {
        addRoute(wrapperMethods.get(node.expression.text), node.arguments[0], node)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

const routeGroups = new Map()
for (const site of routeSites) {
  const key = `${site.method} ${site.path}`
  const route = routeGroups.get(key) ?? { method: site.method, path: site.path, consumers: [] }
  route.consumers.push(`${site.file}:${site.line}`)
  routeGroups.set(key, route)
}
const uniqueRoutes = [...routeGroups.values()]
const sourceCallSites = new Set(routeSites.map((site) => `${site.method} ${site.file}:${site.line}`))
for (const route of uniqueRoutes) route.consumers = [...new Set(route.consumers)].sort()
uniqueRoutes.sort((a, b) => `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`))

if (process.argv.includes('--markdown')) {
  const table = [
    '| Method | Frontend path | Consumer locations |',
    '|---|---|---|',
    ...uniqueRoutes.map((route) => `| \`${route.method}\` | \`${route.path}\` | ${route.consumers.map((consumer) => `\`${consumer}\``).join(', ')} |`),
  ]
  console.log(table.join('\n'))
  process.exit(0)
}

console.log(JSON.stringify({
  sourceCallSites: sourceCallSites.size,
  routeVariants: routeSites.length,
  uniqueMethodPathPairs: uniqueRoutes.length,
  unresolved,
  routes: uniqueRoutes.sort((a, b) => `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`)),
}, null, 2))
