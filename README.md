# Test app using AWS AppSync & DataStorage

## GraphQL schema
[schema.graphql](schema.graphql)

Issues:
- No support of Union (nor possibilities to manage IDs ourself)
- Connections cause issues
- @auth not enough for user management system
- Frontend issue, the first try with DataStore come to an infinite loop

## Adding API
### `amplify init`
```
Event handler PreInit to be implemented.
Note: It is recommended to run this command from the root of your app directory
? Enter a name for the project testapp
? Enter a name for the environment dev
? Choose your default editor: IntelliJ IDEA
? Choose the type of app that you're building javascript
Please tell us about your project
? What javascript framework are you using react
? Source Directory Path:  src
? Distribution Directory Path: build
? Build Command:  npm run-script build
? Start Command: npm run-script start
Using default provider  awscloudformation

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-multiple-profiles.html

? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use default
Adding backend environment dev to AWS Amplify Console app:
```

### `amplify add auth`
```
Using service: Cognito, provided by: awscloudformation
 
 The current configured provider is Amazon Cognito. 
 
 Do you want to use the default authentication and security configuration? Default configuration
 Warning: you will not be able to edit these selections. 
 How do you want users to be able to sign in? Username
 Do you want to configure advanced settings? No, I am done.
```

### `amplify add api`
```
? Please select from one of the below mentioned services: GraphQL
? Provide API name: testapp
? Choose the default authorization type for the API Amazon Cognito User Pool
Use a Cognito user pool configured as a part of this project.
? Do you want to configure advanced settings for the GraphQL API Yes, I want to make some additional changes.
? Configure additional auth types? Yes
? Choose the additional authorization types you want to configure for the API? API Key
? Configure conflict detection? Yes
? Select the default resolution strategy Auto Merge
? Do you have an annotated GraphQL schema? Yes
? Provide your schema file path: schema.graphql

The following types do not have '@auth' enabled. Consider using @auth with @model
         - User
         - Team
         - Organisation
         - OrganisationRole
         - InputField
         - Conditional
         - SectionDelta
         - SectionText
         - SectionFile
         - Template
         - Contract
         - InstanceRole
         - Comment
Learn more about @auth here: https://docs.amplify.aws/cli/graphql-transformer/directives#auth


GraphQL schema compiled successfully.
```

### `amplify push`
```
...
Deployed
```

## Frontend

- `npm i`
- `npm run start`
- Creating a user
- Login in
- Click on "Create comment"

```
Error saving comment InternalError: "too much recursion"
    isGraphQLScalarType types.ts:126
    result utils.ts:82
    getScalarFields utils.ts:80
    generateSelectionSet utils.ts:57
    getNonModelFields utils.ts:143
    getNonModelFields utils.ts:137
    getNonModelFields utils.ts:129
    generateSelectionSet utils.ts:58
    getNonModelFields utils.ts:143
    getNonModelFields utils.ts:137
    getNonModelFields utils.ts:129
    generateSelectionSet utils.ts:58
```

## Cleanup `amplify delete`
