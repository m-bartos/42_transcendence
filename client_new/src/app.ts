// app.ts
import { setPageTitle } from "./utils/utils.js";
import { renderLoginRegistration } from "./components/renderLoginRegistration.js";
import { renderHomePage } from "./components/renderHomePage.js";
import Navigo from "navigo";

setPageTitle("Pong");
try {
    const router = new Navigo("/", { strategy: "ALL" });
    router
        .on("/", () => {
            console.log("Home page");
            renderHomePage();
        })
        .on("/login", () => {
            console.log("Login page");
            renderLoginRegistration();
        })
        .notFound(() => {
            console.log("Not Found");
            router.navigate("/");
        });
    router.resolve();
} catch (error) {
    console.error("Navigo initialization error:", error);
}