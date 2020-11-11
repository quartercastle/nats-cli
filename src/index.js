#!/usr/bin/env node

import nats from 'nats'
import chalk from 'chalk'
import meow from 'meow'
import { Writable } from 'stream'
import splitIntoLines from 'split2'

const cli = meow(`
  Usage
    $ nats <subject> <message>
  Options
    --auth, -a      Authentication, specified as username:password or token
    --host, -h      Host, defaults to localhost
    --port, -p      Port, defaults to 4222
    --stdin         Read messages from stdin
    --version       Check what version of the cli you are running
    --help          Get help
`, {
  flags: {
    auth: {
      type: 'string',
      default: '',
      alia: 'a'
    },
    host: {
      type: 'string',
      default: process.env.NATS_HOST || 'localhost',
      alias: 'h'
    },
    port: {
      type: 'string',
      default: process.env.NATS_PORT || '4222',
      alias: 'p'
    },
    stdin: {
      type: 'boolean',
      default: false
    }
  }
})

const options = {
  url: `nats://${cli.flags.host}:${cli.flags.port}`
}

if (cli.flags.auth.length > 0) {
  if (cli.flags.auth.indexOf(':') > -1) {
    const split = cli.flags.auth.split(':')
    options.username = split[0]
    options.password = split[1]
  } else {
    options.token = cli.flags.auth
  }
}

const client = nats.connect(options)
const subject = cli.input[0]

function publish (msg, cb) {
  client.publish(subject, msg, cb)
}
function printErrorAndAbort (err) {
  console.error(err)
  process.exit(1)
}
function onMessage (msg, reply, subject) {
  console.log(chalk.grey(subject), ':', msg)
}

if (cli.input.length > 1) {
  const [_, ...msgs] = cli.input // eslint-disable-line
  publish(msgs.join(' '), (err) => {
    if (err) printErrorAndAbort(err)
    client.close()
  })
} else if (cli.flags.stdin) {
  process.stdin
    .once('error', printErrorAndAbort)
    .pipe(splitIntoLines())
    .once('error', printErrorAndAbort)
    .pipe(new Writable({
      objectMode: true,
      write: (msg, _, cb) => publish(msg, cb)
    }))
    .once('error', printErrorAndAbort)
    .once('finish', () => client.close())
} else {
  client.subscribe(subject || '>', onMessage)
}
