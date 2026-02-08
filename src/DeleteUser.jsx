import { useAuth } from "react-oidc-context";
import {
  DynamoDBClient,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

export default function useDeleteUser() {
  const auth = useAuth();

  const REGION = "us-east-2";
  const USER_POOL_ID = "us-east-2_lk1vd8Mwx";
  const IDENTITY_POOL_ID = "us-east-2:0d00064d-9170-417c-862e-316009584b52";
  const TABLE_NAME = "RoomCheckUsers";

  async function getCredentials() {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No ID token available");

    return fromCognitoIdentityPool({
      clientConfig: { region: REGION },
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken
      }
    });
  }

  async function deleteUser(userId, email) {
    try {
      const credentials = await getCredentials();

      // 1. Delete from Cognito using email
      const cognitoClient = new CognitoIdentityProviderClient({
        region: REGION,
        credentials
      });

      await cognitoClient.send(
        new AdminDeleteUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: email
        })
      );

      // 2. Delete from DynamoDB using userId
      const dynamoClient = new DynamoDBClient({
        region: REGION,
        credentials
      });

      await dynamoClient.send(
        new DeleteItemCommand({
          TableName: TABLE_NAME,
          Key: {
            userId: { S: userId }
          }
        })
      );

      return { success: true };
    } catch (err) {
      console.error("Delete user error:", err);
      return { success: false, error: err.message };
    }
  }

  return { deleteUser };
}
