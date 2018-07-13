#!/usr/bin/env node

import nats from 'nats'
import chalk from 'chalk'
import meow from 'meow'
import { version } from '../package.json'


const cli = meow(`
  Usage
    $ nats <subject> <message>
  Options
    --host, -h      Host, defaults to localhost
    --port, -p      Port, defaults to 4222
    --version, -v   Check what version of the cli you are running
    --help          Get help
`, {
  flags: {
    host: {
      type: 'string',
      default: process.env.NATS_HOST || 'localhost',
      alias: 'h'
    },
    port: {
      type: 'string',
      default: process.env.NATS_PORT || '4222',
      alias: 'p'
    }
  }
})

const client = nats.connect(`nats://${cli.flags.host}:${cli.flags.port}`)

function listen(msg, reply, subject) {
  console.log(`${chalk.grey(subject)} : ${msg}`)
}

if (cli.input.length > 1) {
  const [_ , ...msg] = cli.input
  client.publish(cli.input[0], msg.join(' '))
  client.subscribe(cli.input[0], () => {
    // Wait for client to send the message before exiting
    process.exit(0)
  })
} else {
  client.subscribe(cli.input[0] || '>', listen)
}
