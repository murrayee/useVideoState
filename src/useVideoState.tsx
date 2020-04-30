import { RefObject, useEffect, useState, useCallback } from "react";

import { PROPERTIES, EVENTS, TRACKEVENTS } from "./constants";

interface IVideoAttrMap {
  [key: string]: any;
  [index: number]: any;
}

const useVideoState = (ref: RefObject<HTMLVideoElement> | IVideoAttrMap) => {
  const [state, setState] = useState({});
  const updateState = useCallback(() => {
    const videoEl = ref.current;
    setState(
      PROPERTIES.reduce((p: IVideoAttrMap, c) => {
        p[c] = videoEl && videoEl[c];
        if (c === "playbackrates" && videoEl) {
          if (videoEl.dataset && videoEl.dataset[c]) {
            p[c] = JSON.parse(videoEl.dataset[c]);
          } else {
            p[c] = JSON.parse(videoEl.getAttribute(`data-${c}`));
          }
        }
        return p;
      }, {})
    );
  }, [ref]);

  const bindEventsToUpdateState = useCallback(() => {
    const videoEl = ref.current;
    EVENTS.forEach((event) => {
      if (videoEl.addEventListener) {
        videoEl.addEventListener(event.toLowerCase(), updateState);
      } else {
        videoEl.attachEvent(`on${event.toLowerCase()}`, updateState);
      }
    });

    TRACKEVENTS.forEach((event) => {
      // TODO: JSDom does not have this method on
      // `textTracks`. Investigate so we can test this without this check.
      videoEl.textTracks &&
        videoEl.textTracks.addEventListener &&
        videoEl.textTracks.addEventListener(event.toLowerCase(), updateState);
    });

    // If <source> elements are used instead of a src attribute then
    // errors for unsupported format do not bubble up to the <video>.
    // Do this manually by listening to the last <source> error event
    // to force an update.
    const sources = videoEl.getElementsByTagName("source");
    if (sources.length) {
      const lastSource = sources[sources.length - 1];
      lastSource.addEventListener
        ? lastSource.addEventListener("error", updateState)
        : lastSource.attachEvent("error", updateState);
    }
  }, [ref, updateState]);

  const unbindEvents = useCallback(
    (videoEl) => {
      EVENTS.forEach((event) => {
        videoEl.removeEventListener
          ? videoEl.removeEventListener(event.toLowerCase(), updateState)
          : videoEl.detachEvent(`on${event.toLowerCase()}`, updateState);
      });

      TRACKEVENTS.forEach((event) => {
        // TODO: JSDom does not have this method on
        // `textTracks`. Investigate so we can test this without this check.
        videoEl.textTracks &&
          videoEl.textTracks.removeEventListener &&
          videoEl.textTracks.removeEventListener(
            event.toLowerCase(),
            updateState
          );
      });

      const sources = videoEl.getElementsByTagName("source");
      if (sources.length) {
        const lastSource = sources[sources.length - 1];
        lastSource.removeEventListener
          ? lastSource.removeEventListener("error", updateState)
          : lastSource.detachEvent("onerror", updateState);
      }
    },
    [updateState]
  );

  useEffect(() => {
    if (ref.current) {
      bindEventsToUpdateState();
    }
    const { current } = ref;

    return () => {
      if (current) {
        unbindEvents(current);
      }
    };
  }, [bindEventsToUpdateState, ref, unbindEvents]);

  return state;
};

export default useVideoState;
