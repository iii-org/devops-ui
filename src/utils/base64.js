export function btoa(code) {
  return Buffer.from(code).toString('base64')
}
