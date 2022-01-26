export default {
    'description': 'CMAS Mobile Application SCAN',
    'arguments': {
        'authKey': {
            title: 'Auth Key',
            hint: 'system provide auth key',
            placeholder: ''
        },
        'cm-url': {
            title: 'location of cmas server',
            hint: 'https://localhost:port',
            placeholder: ''
        },
        'a_report_type': {
            title: 'report type',
            hint: 'type of report, defalut is 2 ( owasp + Government ScanRule)',
            placeholder: '2'
        }
    }
}
