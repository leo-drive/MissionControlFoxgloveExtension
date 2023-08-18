import { motion, AnimatePresence } from "framer-motion";
import Lang from "../languages/a.json";
import { useState } from "react";
import { useAtom } from "jotai";
import { localeAtom, restartAWAtom, restartPCAtom, shutdownPCAtom } from "../jotai/atoms";

const BurgerMenu = () => {
  const [open, setOpen] = useState(false);
  const [_restart, setRestart] = useAtom(restartPCAtom);
  const [_restartAW, setRestartAW] = useAtom(restartAWAtom);
  const [_shutdown, setShutdown] = useAtom(shutdownPCAtom);
  const [locale, _setLocale] = useAtom(localeAtom);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute bottom-6 left-8 flex h-[17.5rem] w-52 cursor-pointer flex-col items-start justify-between rounded-3xl border-[5px] border-[#000]/25 bg-[#1D767E] text-lg"
          >
            <div
              onClick={() => {
                setOpen(false);
              }}
              className="fixed inset-0 -z-10 cursor-default transition-opacity"
            >
              <div className="absolute inset-0"></div>
            </div>
            {/* Restart Autoware */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#00ADB5] p-2"
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
                className="h-12 w-12 rounded-full bg-[#00ADB5] fill-current p-2"
              >
                <path
                  d="M20.62 44.42L3.19998 34.35L38.02 34.38L20.62 44.42ZM20.22 1.81L2.14998 32.78L2.09998 12.34L20.22 1.81ZM21.02 1.81L39.2 12.24L39.25 32.55L21.02 1.81ZM20.62 22.82L38.29 33.92L3.26998 33.89L20.62 22.82ZM20.62 2.03L38.75 32.6L20.61 21.2L2.79998 32.57L20.62 2.03ZM40.57 11.45L20.62 0L0.72998 11.55L0.789982 34.55L20.62 46L40.62 34.45L40.57 11.45Z"
                  fill="black"
                />
              </svg>
              <span className="text-sm">{Lang.missionCont.buttons.awRestart[locale]}</span>
            </div>
            {/* Restart */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#00ADB5] p-2"
              onClick={() => {
                setRestart(true);
                setOpen(!open);
              }}
            >
              <svg
                width="28"
                height="27"
                viewBox="0 0 28 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="h-12 w-12 fill-current p-2 "
              >
                <rect x="0.241821" width="24.88" height="24.88" fill="url(#pattern0)" />
                <defs>
                  <pattern
                    id="pattern0"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <use xlinkHref="#image0_48_75" transform="scale(0.00195312)" />
                  </pattern>
                  <image
                    id="image0_48_75"
                    width="512"
                    height="512"
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAABdYAAAXWAHDylzXAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////Ix8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gnoTy3gAAAP90Uk5TAAECAwQF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"
                  />
                </defs>
              </svg>
              <span className="text-sm">{Lang.missionCont.buttons.pcRestart[locale]}</span>
            </div>
            {/* Power OFF */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#00ADB5] p-2"
              onClick={() => {
                setShutdown(true);
                setOpen(!open);
              }}
            >
              <svg
                width="26"
                height="29"
                viewBox="0 0 26 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 rounded-full bg-[#00ADB5] fill-current p-2"
              >
                <path
                  d="M12.97 0.390015C13.56 0.550015 14.08 0.829983 14.34 1.41998C14.46 1.70998 14.55 2.03003 14.55 2.34003C14.57 5.14003 14.56 7.93999 14.56 10.74C14.56 11.63 14.06 12.32 13.27 12.58C12.5 12.83 11.69 12.57 11.2 11.92C10.95 11.59 10.84 11.21 10.84 10.8C10.84 7.95999 10.83 5.12998 10.84 2.28998C10.84 1.37998 11.39 0.700022 12.27 0.460022C12.32 0.450022 12.37 0.419973 12.42 0.409973C12.6 0.389973 12.79 0.390015 12.97 0.390015Z"
                  fill="#272727"
                />
                <path
                  d="M0.0700073 16C0.160007 11.87 1.69001 8.61998 4.70001 6.05998C5.28001 5.56998 5.94001 5.43996 6.64001 5.72996C7.32001 5.99996 7.71998 6.51999 7.78998 7.25999C7.84998 7.81999 7.67002 8.31996 7.27002 8.72996C6.76002 9.25996 6.17998 9.73998 5.72998 10.31C4.13998 12.32 3.50999 14.62 3.92999 17.16C4.46999 20.46 6.35998 22.76 9.41998 24.06C10.95 24.71 12.56 24.86 14.19 24.55C17.24 23.99 19.47 22.29 20.76 19.49C21.98 16.84 21.89 14.17 20.51 11.57C19.98 10.57 19.26 9.71996 18.4 8.97996C17.98 8.61996 17.67 8.19999 17.61 7.62999C17.53 6.84999 17.83 6.24996 18.48 5.84996C19.14 5.44996 19.83 5.43999 20.46 5.87999C21.29 6.46999 21.98 7.20999 22.61 8.00999C24.05 9.83999 24.94 11.92 25.21 14.23C25.62 17.75 24.73 20.92 22.51 23.69C20.61 26.05 18.16 27.54 15.19 28.14C12.8 28.63 10.46 28.42 8.17999 27.55C5.85999 26.66 3.97001 25.2 2.51001 23.2C1.27001 21.51 0.489971 19.62 0.219971 17.54C0.139971 16.98 0.110007 16.4 0.0700073 16Z"
                  fill="#272727"
                />
              </svg>
              <span className="text-sm">{Lang.missionCont.buttons.pcShutdown[locale]}</span>
            </div>
            {/* Refresh */}
            <div
              className="flex h-12 w-full items-center justify-start rounded-full bg-[#00ADB5] p-2"
              onClick={() => {
                document.location.reload();
                setOpen(!open);
              }}
            >
              <svg
                width="28"
                height="27"
                viewBox="0 0 28 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="h-12 w-12 rotate-[90deg] fill-current p-2"
              >
                <rect x="0.241821" width="24.88" height="24.88" fill="url(#pattern0)" />
                <defs>
                  <pattern
                    id="pattern0"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <use xlinkHref="#image0_48_75" transform="scale(0.00195312)" />
                  </pattern>
                  <image
                    id="image0_48_75"
                    width="512"
                    height="512"
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAABdYAAAXWAHDylzXAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////Ix8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gIx8gnoTy3gAAAP90Uk5TAAECAwQF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"
                  />
                </defs>
              </svg>
              <span className="text-sm">{Lang.missionCont.buttons.refresh[locale]}</span>
            </div>
            {/* <div className="flex items-center justify-start w-12 h-12 p-2 bg-[#00ADB5] rounded-full"> */}
            <button
              className="relative h-12 w-12 rounded-full bg-[#00ADB5] p-2 text-black focus:outline-none"
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
            className="absolute bottom-6 left-8 flex h-14 w-14 cursor-pointer flex-col items-center justify-between rounded-full border-[5px] border-[#222831] bg-[#1D767E] text-lg"
          >
            <button
              className="relative h-12 w-12 rounded-full bg-[#00ADB5] p-2 text-black focus:outline-none"
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
