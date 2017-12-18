It is a work in progress. Any help is appreciated, especially the ones related to for Amazon lambda.
----------------------------------------------------------------------------------------------------

Things to Do, before going into production
------------------------------------------

* Convert code to Typescript/ES6
* Make some kind of pipeline, to push code to Lambda
* Some tests :wanna_cry_no_tears:


Configuring oauth
===================

* Do you allow users to create an account? => Yes
* Authorization URL => 'https://secure.splitwise.com/oauth/authorize'
* Client Id => Consumer Key from your app @ https://secure.splitwise.com/apps
* Domain List => secure.splitwise.com, www.splitwise.com, splitwise.com
* Redirect URLs => Enter one of these to your app @ https://secure.splitwise.com/apps
* Authorization Grant Type => Auth Code Grant
  * Access Token URI => 'https://secure.splitwise.com/oauth/token'
  * Client Secret => Consumer Secret from your app @ https://secure.splitwise.com/apps
  * Client Authentication Scheme => Credentials in Request Body
* Privacy Policy URL => 'https://secure.splitwise.com/terms'

---------------------- 

For Splitwise Application Registration

Go to https://secure.splitwise.com/oauth_clients

Register your application with splitwise
App Name => Alexa-splitwise
App Desc => Something
Homepage URL => https://desolate-depths-61484.herokuapp.com/
Callback URL => https://layla.amazon.com/api/skill/link/M2O9EPHSIOSGJN

---------------------------

AWS Account in N.Virginia

Amazon Developer account