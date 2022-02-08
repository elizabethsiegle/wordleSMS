## Twordle: Wordle SMS 

Shoutout/game idea credit to the [Wordle](https://www.powerlanguage.co.uk/wordle/) word game founder [Josh Wardle]()

Play it over SMS! Text a 5-letter word to +12155156567 to get started.

![sms example](https://user-images.githubusercontent.com/8932430/149054821-f838430b-9843-4d09-862f-a50a94e73123.png)

To run the app, you need 
- A Twilio account - [sign up for a free one here and receive an extra $10 if you upgrade through this link](http://www.twilio.com/referral/iHsJ5D)
- A Twilio phone number with SMS capabilities - [configure one here]
- Node.js installed - [download it here](https://nodejs.org/en/download/)

Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) to help you develop locally and deploy to [Twilio Runtime](https://www.twilio.com/docs/runtime)
```bash
npm install twilio-cli -g
twilio login
twilio plugins:install @twilio-labs/plugin-serverless
```
1. Clone the repo
2. Run `npm install` in the `twordle` root directory
3. Run `twilio serverless:deploy` in the `twordle` root directory

Grab the link ending in `/game`.

The meat of the code to play Twordle in `/functions/game.js`, but you also need the [private Asset](https://www.twilio.com/docs/labs/serverless-toolkit/general-usage#assets) in`Assets/words.txt`. 


In the [phone numbers section of your Twilio Console](https://www.twilio.com/console/phone-numbers/incoming), select a purchased Twilio phone number and scroll down to the <em>Messaging</em> section. Under <em>A MESSAGE COMES IN</em>, change <em>Webhook</em> to <em>Function</em> and then under <em>Service</em> select <em>Twordle</em>, for <em>Environment</em> select <em>dev-environment</em>, and then for <em>Function Path</em> select <em>/game</em>.

Click the <strong>Save</strong> button below and tada🎉! You can now text your Twilio number a 5-letter word to get started playing tWordle!

Loves-me-loves-me-not-tensorflow-python-sms
