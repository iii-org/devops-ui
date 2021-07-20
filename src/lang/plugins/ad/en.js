export default {
  'description': 'Description',
  'host': { title: 'AD host', hint: 'localhost:port', placeholder: '' },
  'ou': { title: 'AD OU ', hint: 'please enter sync organization unit', placeholder: '' },
  'domain': { title: 'AD base DN', hint: 'cn=admin,dc=example.com', placeholder: '' },
  'account': { title: 'account', hint: 'please enter connect ad account', placeholder: 'account' },
  'password': { title: 'password', hint: 'please enter connect ad account password', placeholder: 'password' },
  'default_password': { title: 'System Default Password', hint: 'password', placeholder: 'password' },
  'connect_timeout': { title: 'AD Connect time', hint: 'connection time', placeholder: '5s' },
  'default_role_id': { title: 'Default User Role', hint: 'default user role in system', placeholder: '3' }
}