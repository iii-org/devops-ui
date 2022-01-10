export default {
    'description': '行動APP掃描',
    'arguments': {
        'authKey': {
            title: '認證金鑰',
            hint: '系統所發的認證authKey',
            placeholder: ''
        },
        'cm-url': {
            title: 'CMAS掃描主機位置',
            hint: 'https://localhost:port',
            placeholder: ''
        },
        'a_report_type': {
            title: '報表模式',
            hint: '指定報表的模式，預設(OWASP+工業局規範)',
            placeholder: '2'
        }
    }
}
