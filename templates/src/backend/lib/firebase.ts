import { FirebaseAuthHook } from "@gasboost/auth-realtime-firebase";

const properties = PropertiesService.getScriptProperties();

export const firebase = new FirebaseAuthHook({
  serviceAccount: {
    email: properties.getProperty("serviceAccountEmail")!,
    privateKey: properties.getProperty("privateKey")!,
  },

  utilities: Utilities,
});
