import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {environment} from "../environment/environment"



const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);