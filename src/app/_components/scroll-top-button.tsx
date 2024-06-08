'use client';

import { Button } from "@nextui-org/react";
import { useState } from "react";

export function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const toggleVisible = () => {
        const scrolled = document.documentElement.scrollTop;
        if (scrolled > 300) {
            setVisible(true)
        }
        else if (scrolled <= 300) {
            setVisible(false)
        }
    };
    window.addEventListener('scroll', toggleVisible);

    return visible ? (
        <Button isIconOnly onPress={() => window.scrollTo({ top: 0, behavior: "smooth" })}><UpIcon /></Button>
    ) : null;
}

function UpIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>
}
