import { motion, AnimatePresence } from "framer-motion";
import Lang from "../languages/a.json";
import { useState } from "react";
import { useAtom } from "jotai";
import {
  destinationAtom,
  localeAtom,
  restartAWAtom,
  restartPCAtom,
  shutdownPCAtom,
} from "../jotai/atoms";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { AiOutlineReload } from "react-icons/ai";
import { BsPower } from "react-icons/bs";

const BurgerMenu = () => {
  const [open, setOpen] = useState(false);
  const [_restart, setRestart] = useAtom(restartPCAtom);
  const [_restartAW, setRestartAW] = useAtom(restartAWAtom);
  const [_shutdown, setShutdown] = useAtom(shutdownPCAtom);
  const [locale, _setLocale] = useAtom(localeAtom);
  const [destination, setDestination] = useAtom(destinationAtom);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute bottom-4 left-6 flex h-[22rem] w-52 cursor-pointer flex-col items-start justify-between rounded-3xl bg-[#4C4C4C] text-lg "
          >
            <div
              onClick={() => {
                setOpen(false);
              }}
              className="fixed inset-0 -z-10 cursor-default transition-opacity"
            >
              <div className="absolute inset-0"></div>
            </div>
            {/* Destination back */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#4C4C4C] p-2"
              onClick={() => {
                if (destination) {
                  setDestination(false);
                }

                setOpen(!open);
              }}
            >
              <IoReturnDownBackOutline className="h-12 w-12 rounded-full bg-[#4C4C4C] p-2" />
              <span className="text-sm">Go back</span>
            </div>
            {/* Restart Autoware */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#4C4C4C] p-2"
              onClick={() => {
                setRestartAW(true);
                setOpen(!open);
              }}
            >
              <svg
                width="41"
                height="46"
                viewBox="0 0 41 46"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 rounded-full bg-[#4C4C4C] fill-white p-2"
              >
                <path
                  d="M20.62 44.42L3.19998 34.35L38.02 34.38L20.62 44.42ZM20.22 1.81L2.14998 32.78L2.09998 12.34L20.22 1.81ZM21.02 1.81L39.2 12.24L39.25 32.55L21.02 1.81ZM20.62 22.82L38.29 33.92L3.26998 33.89L20.62 22.82ZM20.62 2.03L38.75 32.6L20.61 21.2L2.79998 32.57L20.62 2.03ZM40.57 11.45L20.62 0L0.72998 11.55L0.789982 34.55L20.62 46L40.62 34.45L40.57 11.45Z"
                  fill="white"
                />
              </svg>
              <span className="text-sm">{Lang.missionCont.buttons.awRestart[locale]}</span>
            </div>
            {/* Restart */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#4C4C4C] p-2"
              onClick={() => {
                setRestart(true);
                setOpen(!open);
              }}
            >
              <AiOutlineReload className="h-12 w-12 fill-white p-2 " />
              <span className="text-sm">{Lang.missionCont.buttons.pcRestart[locale]}</span>
            </div>
            {/* Power OFF */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#4C4C4C] p-2"
              onClick={() => {
                setShutdown(true);
                setOpen(!open);
              }}
            >
              <BsPower className="h-12 w-12 fill-white p-2" />
              <span className="text-sm">{Lang.missionCont.buttons.pcShutdown[locale]}</span>
            </div>
            {/* Refresh */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#4C4C4C] p-2"
              onClick={() => {
                document.location.reload();
                setOpen(!open);
              }}
            >
              <AiOutlineReload className="h-12 w-12 rotate-[90deg] fill-white p-2" />
              <span className="text-sm">{Lang.missionCont.buttons.refresh[locale]}</span>
            </div>
            {/* <div className="flex items-center justify-start w-12 h-12 p-2 bg-[#4C4C4C] rounded-full"> */}
            <button
              className="relative h-8 w-8 rounded-full bg-[#4C4C4C] p-4 text-white focus:outline-none self-end mr-2 mb-2"
              onClick={() => setOpen(!open)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="absolute left-1/2 top-1/2 block w-5 -translate-x-1/2 -translate-y-1/2 transform">
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-5 transform bg-current transition duration-500 ease-in-out ${
                    open ? "rotate-45" : "-translate-y-1.5"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block  h-0.5 w-5 transform   bg-current transition duration-500 ease-in-out ${
                    open && "opacity-0"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block  h-0.5 w-5 transform bg-current  transition duration-500 ease-in-out ${
                    open ? "-rotate-45" : "translate-y-1.5"
                  }`}
                ></span>
              </div>
            </button>
            {/* </div> */}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute bottom-4 left-6 flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-full bg-[#D9D9D9] text-lg"
          >
            <button
              className="relative h-10 w-10 rounded-full bg-[#D9D9D9] p-2 text-black focus:outline-none"
              onClick={() => setOpen(!open)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="absolute left-1/2 top-1/2 block w-5 -translate-x-1/2 -translate-y-1/2 transform">
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-5 transform bg-current transition duration-500 ease-in-out ${
                    open ? "rotate-45" : "-translate-y-1.5"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block  h-0.5 w-5 transform   bg-current transition duration-500 ease-in-out ${
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    open && "opacity-0"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block  h-0.5 w-5 transform bg-current  transition duration-500 ease-in-out ${
                    open ? "-rotate-45" : "translate-y-1.5"
                  }`}
                ></span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BurgerMenu;
