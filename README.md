# react-hooks react-usevideostate

**react-usevideostate** 初始化 video 属性以及事件绑定

## Installation

```bash
# with NPM
npm install react-usevideostate --save-dev

# with Yarn
yarn add react-usevideostate
```

## Usage

```jsx
import useVideoState from "react-usevideostate";

const Example = () => {
  const videoRef = useRef(null);
  const videoState = useVideoState(videoRef);
  useEffect(() => {
    console.log(videoState);
  }, [videoState]);

  return (
    <div>
      <video
        width="500"
        height="400"
        controls
        ref={videoRef}
        src="https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4"
      ></video>
    </div>
  );
};
```
