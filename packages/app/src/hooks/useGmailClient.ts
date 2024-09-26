// import { google } from "googleapis";

// const gmail = google.gmail("v1");

/* const auth = new google.auth.OAuth2(
  'process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID',   
  'process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET',
  'http://localhost:3002'  
);

auth.setCredentials({ access_token: accessToken });  */

/*
 * users.getProfile
 */

export async function fetchProfile(accessToken: string): Promise<string> {
  const url = `https://www.googleapis.com/gmail/v1/users/me/profile`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();

    console.log("fetchProfile data: ", data);
    return data.emailAddress;
  } else {
    console.error("Failed to fetch emails:", response);

    throw new Error("Failed to fetch emails");
  }
}

/*
 * messages.list
 */

export type GmailMessagesListResponse = {
  messages: Array<{
    id: string;
    threadId: string;
  }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* export async function fetchEmailsWithSubject(
  auth: any,
  subject: string
): Promise<any[]> {
  let pageToken: string | undefined;
  let allMessages: any[] = [];
  let retryCount = 0;
  const maxRetries = 5;

  const query = `subject:(${subject})`;

  do {
    try {
      const res = await gmail.users.messages.list({
        auth: auth,
        userId: "me",
        q: query,
        maxResults: 500,
        pageToken: pageToken,
      });

      const messages = res.data.messages || [];
      allMessages = allMessages.concat(messages);
      pageToken = res.data.nextPageToken;


      if (messages.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < messages.length; i += batchSize) {
          const batch = messages.slice(i, i + batchSize);
          const batchResults = await fetchMessagesBatch(
            auth,
            batch.map((m) => m.id)
          );

          console.log(`Fetched ${batchResults.length} messages`);
        }
      }

      retryCount = 0; 
      await delay(1000); 
    } catch (error: any) {
      if (error.code === 429) {
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`Rate limited. Retrying in ${waitTime}ms`);
        await delay(waitTime);
      } else {
        console.error("The API returned an error:", error);
        break;
      }

      if (retryCount >= maxRetries) {
        console.error("Max retries reached. Stopping.");
        break;
      }
    }
  } while (pageToken);

  return allMessages;
} */

/* async function fetchMessagesBatch(auth: any, ids: string[]): Promise<any[]> {
  const batch = ids.map((id) => ({
    requestBody: {
      ids: [id],
      format: "metadata",
      metadataHeaders: ["Subject"],
    },
    userId: "me",
  }));

  const res = await gmail.users.messages.batchGet({
    auth: auth,
    userId: "me",
    requestBody: { ids },
  });

  return res.data.messages || [];
} */

export async function fetchEmailList(
  accessToken: string,
  queryParams: any,
  subjectStartsWith?: string
): Promise<GmailMessagesListResponse[]> {
  const defaultParams = {
    maxResults: 50,
  };

  let allResults: GmailMessagesListResponse[] = [];
  let pageToken: string | undefined;

  do {
    const finalQueryParams = { ...defaultParams, ...queryParams };

    if (subjectStartsWith) {
      finalQueryParams.q = `subject:(${subjectStartsWith})`;
    }

    if (pageToken) {
      finalQueryParams.pageToken = pageToken;
    }

    const queryString = new URLSearchParams(finalQueryParams).toString();
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?${queryString}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 429) {
        console.log("Rate limit hit. Waiting before retry...");
        await delay(60000);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch emails:", response.status, errorData);

        if (
          errorData.error &&
          errorData.error.message === "Invalid pageToken"
        ) {
          console.log("Invalid pageToken. Stopping pagination.");
          break;
        }

        throw new Error(`Failed to fetch emails: ${response.status}`);
      }

      const data: GmailMessagesListResponse = await response.json();
      allResults.push(data);

      pageToken = data.nextPageToken;

      if (data.messages && data.messages.length > 0) {
        for (const message of data.messages) {
          try {
            await delay(100);
            const fullMessage = await fetchEmailsRaw(accessToken, [message.id]);
            console.log("Fetched email:", fullMessage[0].subject);
          } catch (error) {
            console.error("Error fetching individual email:", error);
          }
        }
      }

      await delay(1000);
    } catch (error) {
      console.error("Error in fetchEmailList:", error);
      break; // Exit the loop on error
    }
  } while (pageToken);

  return allResults;
}

/*
 * messages.get
 */

export type RawEmailResponse = {
  subject: string;
  internalDate: string;
  decodedContents: string;
};

export async function fetchEmailsRaw(
  accessToken: string,
  messageIds: string[]
): Promise<RawEmailResponse[]> {
  try {
    const fetchPromises = messageIds.map((messageId) => {
      const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=raw`;

      return fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch email with ID: ${messageId}`);
          }

          return response.json();
        })
        .then((data) => {
          console.log("fetchEmailsRaw data: ", data);
          let rawBase64 = data.raw.replace(/-/g, "+").replace(/_/g, "/");
          console.log("rawBase64 data: ", rawBase64);
          while (rawBase64.length % 4) {
            rawBase64 += "=";
          }

          const decodedContents = atob(rawBase64);

          console.log("decodedContents data: ", decodedContents);

          const subject =
            decodedContents.match(/Subject: (.*)/)?.[1] || "No Subject";

          return {
            subject,
            internalDate: data.internalDate,
            decodedContents,
          };
        }) as Promise<RawEmailResponse>;
    });

    const results = await Promise.all(fetchPromises);

    return results;
  } catch (error) {
    console.error("Error fetching emails:", error);

    throw new Error("Error fetching emails");
  }
}
