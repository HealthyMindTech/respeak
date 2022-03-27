# Respeak

## Problem

The burden of mental illness is among the highest of all diseases, and mental disorders are among the most common causes of disability. The Covid pandemic has made people more isolated than ever before in their lives. The social life expectations today are much higher than before, and in many countries, mental disorders come with a stigma. When diagnosed, a number of mental health disorders can fortunately be treated, and various therapies and medications can be prescribed to the individual, but many people today still remain undiagnosed and suffer more than needed. 

A particular common symptom is that depressed people often get stuck in a mental rut. We all have bad days and by talking through them, with our friends, family, therapist, or stranger on the street, we are able to talk through our thoughts, structure them, and get new perspectives. It's a tool we use as humans and it can help reduce stress. We want to make this available to anyone at any time. 

*Existing solutions*: Therapy sessions, as well as pharmacological interventions, exist. In terms of digital solutions, there are a number of solutions that are able to support people with information about mental health, chatbots with predefined paths, questionnaires for diagnosis, wearables that can measure physiological signals (such as sleep). 

## Product

A therapist helps you reframe your thoughts. But their resources are limited. We help provide new perspectives via an online community. The other people in the community will help you reframe your thoughts. 

*How it works*: The solution functions as a therapy,  you can do it online, it's anonymous, it takes just a few minutes, you can do it every day, and start seeing the world in a new light.

*Main benefits*: (1) See things from a new perspective (2) Help others

*Benefits for therapists and society*: More people can be serviced remotely with a tool to cope with their daily life, as well as have a potential tool for collecting data signals for predicting depression. 

*Target audience*: anyone that might be feeling a bit anxious, depressed, feeling sad or alone, would like to vent, or learn more about a useful toolkit to deal with daily life. 

*Science behind*: The solution is based on cognitive behavioral therapy (CBT) principles, specifically cognitive restructuring (CR, also called cognitive reframing) for tackling cognitive distortions. It is a therapeutic process that helps one challenge and modify or replace their negative irrational thoughts (cognitive distortions).

*Tech*: The solution is a progressive web app built using React.js, with a backend on Firebase that is used for storage, functions, and hosting. We also use OpenAI for generating reformulations when not enough users are logged in on the platform to reformulate thoughts. 

*Regulatory framework considerations*: The solution in the current version has not been validated for medical purposes. For information and advice on health, we redirect users to healthcare professionals. 

## Who we are

We are a team of 5, with combined experience of over 30 years in software development, health tech, pharmaceuticals, and mental health support. We are a very enthusiastic and motivated team working towards healthier lives through innovative digital health solutions. 

## Next steps & Future Work

*Future feature development plans*: reputation system, login system, ability to add friends or a caregiver, chatting with the community, creating groups, content moderation (potentially via OpenAI), handling of data under GDPR, paid component once we get professional therapists to join the community as well, prediction of depression based on user interaction in the solution (change over time) and through that ensuring we can direct them to healthcare professionals, integration of chat functionality with virtual users (sometimes people are more open to talk with something or someone who doesn't judge you), integration with additional sources of information (for example, on what depression is, the symptoms, available therapies, and what to prepare for when going to a therapist for an evaluation, where to seek help). 

*Join us* We are looking for people to join the Respeak community: join at https://respeak.app

*Collabs* We would also like to hear from therapists that would like to partner with us to further develop the paid part of the platform, health policy advisors that can help implement the solution at national levels, and potential medication manufacturers that can see an opportunity in combining our solution with their intervention. 

## References and further reading

* CBT’s Cognitive Restructuring (CR) For Tackling Cognitive Distortions (https://positivepsychology.com/cbt-cognitive-restructuring-cognitive-distortions/)
* Cognitive Restructuring: Working with Thoughts that Aren’t Working for You (https://cogbtherapy.com/cognitive-restructuring-in-cbt)


## Development instructions

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

You should be connected to the emulator now.


To deploy to firebase. Make sure you have the firebase cli installed:

and then build the project.
```
$ npm run build
```

After build has succeeded, use firebase tools to deploy:

```
$ firebase deploy
```

To deploy the frontend app, do:
```
$ npm run deploy-frontend
```

