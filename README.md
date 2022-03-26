# Respeak

To run a test version of this app, clone the repository and install the npm modules:

```
$ npm install
```

Run a test server:

```
$ npm run start
```

Testing with firebase emulator. First start firebase emulator:

```
$ cd functions && npm run serve
```

If you want to have your firebase functions continously monitored for updates, in parallel run:

```
$ cd functions && npm run watch
```

Then when starting up the frontend developer server, run:

```
$ REACT_APP_USE_EMULATOR=1 npm run start
```

You should be connect to the emulator now.


To deploy to firebase. Make sure you have the firebase cli installed:

and then build the project.
```
$ npm run build
```

After build has succeeded, use firebase tools to deploy:

```
$ firebase deploy
```

