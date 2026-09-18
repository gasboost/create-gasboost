import { FirebaseRtdb } from "@gasboost/realtime-firebase";
import { tutorialTable } from "../../shared/tables";
import { tutorialRls } from "./rls";

export const rtdb = FirebaseRtdb.generate({
  tables: [tutorialTable] as const,
  rowLevelSecurity: [tutorialRls],
  principal: {
    id: "auth.uid",
  },
});
