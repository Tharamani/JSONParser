
// null parser
const nullParser = input => {
  console.log('nullParser', input)
  if (!input.startsWith('null')) return null
  return [null, input.slice(4)]
}

// boolean parser
const boolenParser = input => {
  if (input.startsWith('true')) return [true, input.slice(4)]
  if (input.startsWith('false')) return [false, input.slice(5)]
  return null
}

// number parser
const numberParser = input => {
  console.log('numberParser', input)
  const output = input.match(/^-?((([1-9])(\d*))|(0))(\.\d+)?([Ee][+-]?\d+)?/)
  if (output) return [Number(output[0]), input.slice(output[0].length)]
  return null
}

// String parser " "
const stringParser = (input) => {
  if (!input.startsWith('"')) return null
  input = input.slice(1)
  let output = ''
  const escapeCharMap = { b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', '"': '\\"', '/': '\\/', '\\': '\\', u: 'u' }
  while (input[0] !== '"' && input[0]) {
    if (input[0].match(/[\u0000-\u001f]/i) || input[0].match(/[\u007F]/i)) return null
    if (input[0] === '\\') {
      if (Object.keys(escapeCharMap).includes(input[1])) {
        if (escapeCharMap[input[1]] !== 'u') { // special char
          output += escapeCharMap[input[1]]
          input = input.slice(2)
        } else if (escapeCharMap[input[1]] === 'u') { // u with hexa
          const hexaValue = input.slice(2, 6)
          if (!hexaValue.match(/[0-9A-Fa-f]{4}/i)) return null
          const character = String.fromCharCode(parseInt(hexaValue, 16))
          output += character
          input = input.slice(6)
        }
      } else return null
    } else {
      output += input[0]
      input = input.slice(1)
    }
  }
  if (input[0] === '"') return [output, input.slice(1)]
  return null
}

// Value parser
const valueParser = (input) => {
  console.log('valueParser', typeof input)
  input = input.trim()
  return nullParser(input) || numberParser(input) || boolenParser(input) || stringParser(input) || arrayParser(input) || objectParser(input)
}

// Array parser [  ]
const arrayParser = (input) => {
  if (!input.startsWith('[')) return null
  const output = []
  input = input.slice(1).trim()
  if (input[0] === (']')) return [output, input.slice(1)]

  const parsed = valueParser(input)
  if (parsed === null) return null
  output.push(parsed[0])
  input = parsed[1].trim()

  while (input[0] !== ']') {
    if (input[0] !== ',') return null
    input = input.slice(1)

    const parsed = valueParser(input)
    if (parsed === null) return null
    output.push(parsed[0])
    input = parsed[1].trim()
  }
  if (input[0] === ']') return [output, input.slice(1)]
  return null
}
console.log(arrayParser('[  ]'))

// Object parser
const objectParser = (input) => {
  if (!input.startsWith('{')) return null
  const output = {}
  input = input.slice(1).trim()
  if (input[0].startsWith('}')) return [output, input.slice(1)]

  // change to key
  const pKey = stringParser(input)
  if (pKey === null) return null
  const key = pKey[0]
  input = pKey[1].trim()

  // check ':'
  if (input[0] !== ':') return null
  input = input.slice(1).trim()

  // parse for value //change to value
  const pValue = valueParser(input)
  if (pValue === null) return null
  const value = pValue[0]
  input = pValue[1].trim()

  output[key] = value

  while (input[0] !== '}' && input[0]) {
    if (input[0] !== ',') return null
    input = input.slice(1).trim()
    // parse key
    const pKey = stringParser(input)
    if (pKey === null) return null
    const key = pKey[0]
    input = pKey[1].trim()

    // check ':'
    if (input[0] !== ':') return null
    input = input.slice(1).trim()

    // parse for value
    const pValue = valueParser(input)
    if (pValue === null) return null
    const value = pValue[0]
    input = pValue[1].trim()

    output[key] = value
  }
  if (input[0] === '}') return [output, input.slice(1)]
  return null
}

const fs = require('fs')
const FOLDER_PATH = './testcases/'

// Json parser
const JSONParser = (input) => {
  const parsedJsonValue = valueParser(input)
  if (parsedJsonValue === null) return null

  const validJSON = parsedJsonValue[0]
  if (parsedJsonValue[1] !== '') return null
  return validJSON
}

// Reads all the files from folder and parses each file content
const readFolder = (dirname) => {
  console.log('Read all files from DIR', dirname)
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      console.log('Error ', err)
      return
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, 'utf-8', function (err, content) {
        if (err) {
          console.log('Error ', err)
        }

        console.log(`Filename: ${filename} :`, filename.startsWith('primitivedata')
          ? (JSONParser(content) ? 'Pass' : 'Fail')
          : '')

        // console.log(`Filename: ${filename} :`, JSONParser(content) ? 'Pass' : 'Fail')
      })
    })
  })
}
readFolder(FOLDER_PATH)
