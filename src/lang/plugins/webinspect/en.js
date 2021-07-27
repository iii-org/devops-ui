export default {
  'description': 'Webinspect security test',
  'arguments': {
    'wi-base-url': { title: 'Server URL', hint: 'Please enter server url', placeholder: 'URL of the Webinspect server.' },
    'wi-type': { title: 'Webinspect Type', hint: 'Please enter webinspect type', placeholder: '"WIE" if using Webinspect enterprise, empty string for others.' },
    'wi-username': { title: 'Username', hint: 'Please enter username', placeholder: 'Username of Webinspect.' },
    'wi-password': { title: 'Password', hint: 'Please enter password', placeholder: 'Password of Webinspect.' }
  }
}
