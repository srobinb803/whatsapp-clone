import { useEffect } from "react";

export const useViewPort = () => {
    useEffect(() => {
        if(!window.visualViewport) return;
        const handleResize = () => {
            const vh = window.visualViewport?.height;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };
        handleResize();
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize);
    }, []);
}