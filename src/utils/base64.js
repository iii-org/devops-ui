const a = 'base64'
const b = 'binary'

export function btoa(code) {
  return Buffer.from(code, b).toString(a)
}

export function atob(code) {
  return Buffer.from(code, a).toString(b)
}
