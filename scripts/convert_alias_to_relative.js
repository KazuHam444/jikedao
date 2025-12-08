const fs = require('fs')
const path = require('path')

const repoRoot = process.cwd()
const srcRoot = path.join(repoRoot, 'frontend', 'src')
const exts = ['.js', '.ts', '.vue', '.jsx', '.mjs', '.cjs']

function walk(dir) {
  const results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const fp = path.join(dir, file)
    const stat = fs.statSync(fp)
    if (stat && stat.isDirectory()) {
      results.push(...walk(fp))
    } else {
      if (exts.includes(path.extname(fp))) results.push(fp)
    }
  })
  return results
}

function replaceInFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8')
  const original = src

  // regex to match import/require/dynamic import with @/
  // Also handle plain import ... from '@/path'
  // We'll perform replacements globally

  src = src.replace(/(['"])@\/(.+?)\1/g, (m, q, p) => {
    const absTarget = path.join(srcRoot, p)
    let rel = path.relative(path.dirname(filePath), absTarget)
    rel = rel.replace(/\\/g, '/')
    if (!rel.startsWith('.')) rel = './' + rel
    return q + rel + q
  })

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8')
    return true
  }
  return false
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error('frontend/src not found — aborting')
    process.exit(1)
  }
  const files = walk(srcRoot)
  const changed = []
  files.forEach(f => {
    try {
      const ok = replaceInFile(f)
      if (ok) changed.push(f)
    } catch (e) {
      console.error('Error processing', f, e)
    }
  })

  console.log('Processed files:', files.length)
  console.log('Changed files:', changed.length)
  changed.forEach(f => console.log('  ', path.relative(repoRoot, f)))
}

main()
