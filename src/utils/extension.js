import { getFileNameList, getUploadFileType } from '@/api_v2/fileType'

export const getFileTypeLimit = async() => {
  const res = await getFileNameList()
  return res.data.toString()
}

export const getFileTypeList = async() => {
  const data = {}
  const res = await getUploadFileType()
  res.data.upload_file_types.forEach((item) => {
    data[item['MIME Type']] = item['file extension']
  })
  return data
}

export const isAllowedFileTypeList = (fileList, fileType) => {
  const map = fileList
  return map[fileType] !== undefined
}

export const allowedTypeMap = () => ({
  'audio/aac': '.aac',
  'application/x-abiword': '.abw',
  'application/x-freearc': '.arc',
  'video/x-msvideo': '.avi',
  'application/vnd.amazon.ebook': '.azw',
  'application/octet-stream': '.bin',
  'image/bmp': '.bmp',
  'application/x-bzip': '.bz',
  'application/x-bzip2': '.bz2',
  'application/x-csh': '.csh',
  'text/css': '.css',
  'text/csv': '.csv',
  'text/xml': '.xml',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-fontobject': '.eot',
  'application/epub+zip': '.epub',
  'application/gzip': '.gz',
  'image/gif': '.gif',
  'text/html': '.html',
  'image/vnd.microsoft.icon': '.ico',
  'text/calendar': '.ics',
  'application/java-archive': '.jar',
  'image/jpeg': '.jpeg',
  'text/javascript': '.js',
  'application/json': '.json',
  'application/ld+json': '.jsonld',
  'audio/midi': '.mid',
  'audio/x-midi': '.midi',
  'audio/mpeg': '.mp3',
  'video/mpeg': '.mpeg',
  'application/vnd.apple.installer+xml': '.mpkg',
  'application/vnd.oasis.opendocument.presentation': '.odp',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/vnd.oasis.opendocument.text': '.odt',
  'audio/ogg': '.oga',
  'video/ogg': '.ogv',
  'application/ogg': '.ogx',
  'audio/opus': '.opus',
  'font/otf': '.otf',
  'image/png': '.png',
  'application/pdf': '.pdf',
  'application/x-httpd-php': '.php',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.rar': '.rar',
  'application/rtf': '.rtf',
  'application/x-sh': '.sh',
  'image/svg+xml': '.svg',
  'application/x-shockwave-flash': '.swf',
  'application/x-tar': '.tar',
  'image/tiff': '.tiff',
  'video/mp2t': '.ts',
  'font/ttf': '.ttf',
  'text/plain': '.txt',
  'application/vnd.visio': '.vsd',
  'audio/wav': '.wav',
  'audio/webm': '.weba',
  'video/webm': '.webm',
  'image/webp': '.webp',
  'font/woff': '.woff',
  'font/woff2': '.woff2',
  'application/xhtml+xml': '.xhtml',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/xml': '.xml',
  'application/vnd.mozilla.xul+xml': '.xul',
  'application/zip': '.zip',
  'multipart/x-zip': '.zip',
  'application/x-compressed': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/x-rar': '.rar',
  'application/x-rar-compressed': '.rar',
  'video/3gpp': '.3gp',
  'audio/3gpp': '.3gp',
  'video/3gpp2': '.3g2',
  'audio/3gpp2': '.3g2',
  'application/x-7z-compressed': '.7z'
})

export const isAllowedTypes = fileType => {
  const map = allowedTypeMap()
  return map[fileType] !== undefined
}

export const isJSON = fileType => {
  const map = {
    'application/json': '.json'
  }
  return map[fileType] !== undefined
}

export const fileSizeToMB = fileSize => fileSize / 1024 ** 2

export const containSpecialChar = fileName => {
  const reg = /[\\/:*?"<>|#{}%~&]/
  return reg.test(fileName)
}
