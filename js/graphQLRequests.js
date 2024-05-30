export async function GraphQLRequest(queryBody, userToken) {
    try {
        const response = await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(queryBody),
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorMsg}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error; // Re-throw the error to let the caller handle it if needed
    }
};

export async function GetUserProfileInfo(userToken) {
    const query = `
    {
        user {
            id
            login
            attrs
        }
    }`;
    const queryBody = {
        query,
    };

    try {
        const response = await GraphQLRequest(queryBody, userToken);
        return response;
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

export async function GetUserTransactions(userToken) {
    const query = `
    {
        transaction {
            id
            type
            amount
            userId
            attrs
            createdAt
            path
            objectId
            eventId
            campus
        }
    }`;
    const queryBody = {
        query,
    };

    try {
        const response = await GraphQLRequest(queryBody, userToken);
        return response;
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        throw error;
    }
}

export async function GetGradeForProjectByObjectId(userToken, objectId) {
    const query = `
    {
        result(where: { objectId: { _eq: ${objectId}}}){
            grade
        }
    }`;
    const queryBody = {
        query,
    };

    try {
        const response = await GraphQLRequest(queryBody, userToken);
        return response;
    } catch (error) {
        console.error('Error fetching grade:', error);
        throw error;
    }
}

export async function GetUserAudits(userToken) {
    const query = `
    {
        audit(
          where: {_and: [{resultId: {_neq: 0}}, {grade: {_neq: 0}}, {auditorId: {_eq: 9501}}]}
        ) {
          id
          groupId
          auditorId
          attrs
          grade
          createdAt
          updatedAt
          resultId
          version
          endAt
          private {
            code
          }
        }
      }`;
    const queryBody = {
        query,
    };

    try {
        const response = await GraphQLRequest(queryBody, userToken);
        return response;
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        throw error;
    }
}