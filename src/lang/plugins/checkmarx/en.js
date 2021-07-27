export default {
  'description': 'Checkmarx source code scan',
  'arguments': {
    'client-secret': { title: 'Client Secret', placeholder: 'Secret of the Checkmarx client.' },
    'cm-url': { title: 'Server URL', hint: 'please enter Server URL', placeholder: 'Server URL of the Checkmarx server.' },
    'username': { title: 'Username', hint: 'please enter username', placeholder: 'Username of Checkmarx.' },
    'password': { title: 'Password', hint: 'please enter password', placeholder: 'Password of Checkmarx.' }
  }
}
