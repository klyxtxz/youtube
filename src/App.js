// js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import axios from "axios";
import { invoke } from '@tauri-apps/api'


function App() {
  // handle what happens on key press

  invoke('greet', { name: 'World1111111111111111111111111111111111111' })
  // `invoke` returns a Promise
  .then((response) => {headings.current[0].text=response});

  const iframeWindow = useRef(null);
  const playerRef = useRef(null);
  const lineArr = useRef(0);
  const realIndex = useRef(0);
  const input = useRef(0);
  const headings = useRef(Array(7).fill({ 'text': 'Heading 1' }));
  const [videoId, setVideoId] = useState('H14bBuluwB8');
  const [index, setindex] = useState(0);
  const [time, settime] = useState(0);
  const handleKeyPress = useCallback((event) => {
    console.log(`Key pressed: ${event.keyCode}`);

    if (event.keyCode === 17) {
      //ctrl开始本段
      if (playerRef !== null) {
        playhere()
        console.log(realIndex.current)
      }
    }
    if (event.keyCode === 27) {
      //esc开启上一段
      if (playerRef !== null) {
        last()
        playhere()
      }
    }
    if (event.keyCode === 34) {
      //pagedown开启下一段
      if (playerRef !== null) {
        next()
        playhere()
      }
    }

  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    playerRef.current = event.target;
    event.target.pauseVideo();
    invoke('getcaption',{id:videoId}).then(function (value) {
      headings.current = JSON.parse(value)
    }, function (error) {
      console.log(error)
    });
    iframeWindow.current = event.target.getIframe().contentWindow;
    window.addEventListener("message", handlePostMessage);
  }


  const handlePostMessage = (event) => {
    // Check that the event was sent from the YouTube IFrame
    if (event.source === iframeWindow.current) {
      var data = JSON.parse(event.data);
      // The "infoDelivery" event is used by YT to transmit any kind of information
      // change in the player (eg. current time, playback quality change)
      if (
        data.event === "infoDelivery" &&
        data.info &&
        data.info.currentTime
      ) {
        settime(data.info.currentTime);
        var lines = headings.current
        for (let index1 = 0; index1 < lines.length; index1++) {
          if (data.info.currentTime > lines[index1].start && data.info.currentTime < (lines[index1].start + lines[index1].duration)) {
            //未发生变化，更新字幕
            if (realIndex.current == index1) {
              if (index1 <= 3) { lineArr.current = index1 }
              if (index1 >= lines.length - 7) { setindex(lines.length - 7); return }
              if (index1 > 3 && index1 != (index1 - 3)) {
                setindex(index1 - 3);
                return
              }
              //realIndex发生变化，暂停视频
            }else{
              playerRef.current.pauseVideo()
            }
          }

        }
      }
    }
  }

  const next = () => {
    realIndex.current = realIndex.current + 1
    playerRef.current.seekTo(headings.current[realIndex.current].start, true);
  }

  const playhere = () => {
    playerRef.current.seekTo(headings.current[realIndex.current].start, true);
    playerRef.current.playVideo();
  }

  const last = () => {
    realIndex.current = realIndex.current - 1
    playerRef.current.seekTo(headings.current[realIndex.current].start, true);
  }

  const freshline = () => {

  }



  const handelDictationCheck = (event) => {
    if (event.keyCode === 13) {
      var thisline = headings.current[realIndex.current].text.replaceAll(",", "").replaceAll("\n", " ").replaceAll("'", "").replaceAll(".", "").replaceAll(":", "").replaceAll("-", "").replaceAll("?", "").toLowerCase().trim()
      if (event.target.value === thisline) {
        event.target.value = ""
        //输入成功，前往下一段
        next();
        playhere();
      }
      return
    }
    if (event.keyCode === 16) {
      var thisline = headings.current[realIndex.current].text.replaceAll(",", "").replaceAll("\n", " ").replaceAll("'", "").replaceAll(".", "").replaceAll(":", "").replaceAll("-", "").replaceAll("?", "").toLowerCase().trim()
      //?键显示答案
      console.log(thisline)
      if (event.target.value === thisline) {
        event.target.value = input.current
      } else {
        input.current = event.target.value
        event.target.value = thisline
      }
    }
  };
  const handleInputChange = (event) => {
    if (event.keyCode === 13) {
      var id = event.target.value.split("?v=")[1]
      console.log(id)
      setVideoId(id);
      invoke('getcaption',{id:videoId}).then(function (value) {
        headings.current = JSON.parse(value)
      }, function (error) {
        console.log(error)
      });
    }
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '390',

    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      "autoplay": 1,
      "origin": 'http://localhost:3000'
    },
  };



  return (
    <div className="App">
      <div className="container">
        <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} />
        <input style={{ width: "99%", "text-align": "center" }} type="text" defaultValue={'https://www.youtube.com/watch?v=H14bBuluwB8'} onChange={(event) => { }} onKeyDown={handleInputChange} />
        <div style={{ "text-align": "center" }}>
          <h3 >{(0 < lineArr.current) ? headings.current[index + 0].text : "*".repeat(headings.current[index + 0].text.length)}</h3>
          <h3 >{(1 < lineArr.current) ? headings.current[index + 1].text : "*".repeat(headings.current[index + 1].text.length)}</h3>
          <h3 >{(2 < lineArr.current) ? headings.current[index + 2].text : "*".repeat(headings.current[index + 2].text.length)}</h3>
          <input style={{ width: "99%", height: 50, fontSize: 19, fontWeight: 'bold', "text-align": "center" }} type="text" onChange={(event) => { }} onKeyDown={handelDictationCheck} />
          <h3 >{(3 < lineArr.current) ? headings.current[index + 3].text : "*".repeat(headings.current[index + 3].text.length)}</h3>
          <h3 >{(4 < lineArr.current) ? headings.current[index + 4].text : "*".repeat(headings.current[index + 4].text.length)}</h3>
          <h3 >{(5 < lineArr.current) ? headings.current[index + 5].text : "*".repeat(headings.current[index + 5].text.length)}</h3>
          <h3 >{(6 < lineArr.current) ? headings.current[index + 6].text : "*".repeat(headings.current[index + 6].text.length)}</h3>



        </div>
      </div>
    </div>
  )
  }
export default App;