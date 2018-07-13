# nats-cli

Publish or subscribe to NATS subjects from the cli.

### Install
```sh
npm install -g nats-cli
```

### Usage
```sh
# Listen on all subjects
nats

# Listen on the foo subject
nats foo

# Publish message on the subject foo
nats foo bar

# Listen with wildcards
nats 'foo.>'
```
