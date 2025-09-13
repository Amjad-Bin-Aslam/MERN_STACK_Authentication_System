import { createContext, useState } from "react";

export const AppContext = createContext()


export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggeedIn , setIsLoggedIn] = useState(false);
    const [userData , setUserData] = useState(false);

    const value = {
        backendUrl,
        isLoggeedIn , setIsLoggedIn,
        userData , setUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}