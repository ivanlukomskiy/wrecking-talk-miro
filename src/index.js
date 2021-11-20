const { board } = window.miro;

function runSpeechRecognition(onAnythingSaid, onFinalised, onEndEvent) {
    var language = 'en-US';
    if (!('webkitSpeechRecognition' in window)) {
        throw new Error("This browser doesn't support speech recognition. Try Google Chrome.");
    }
    var SpeechRecognition = window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.interimResults = !!onAnythingSaid;
    recognition.lang = language;
    var finalTranscript = ''; // process both interim and finalised results

    recognition.onresult = function (event) {
        var interimTranscript = ''; // concatenate all the transcribed pieces together (SpeechRecognitionResult)

        for (var i = event.resultIndex; i < event.results.length; i += 1) {
            if(event.results[i].length === 0) {
                continue;
            }
            var transcriptionPiece = event.results[i][0].transcript; // check for a finalised transciption in the cloud
            if (event.results[i].isFinal) {
                finalTranscript += transcriptionPiece;
                onFinalised(finalTranscript);
                finalTranscript = '';
            } else if (recognition.interimResults) {
                interimTranscript += transcriptionPiece;
                onAnythingSaid(interimTranscript);
            }
        }
    };

    recognition.onend = function () {
        onEndEvent();
    };
    recognition.start();
}

async function init() {
  await board.ui.on("icon:click", async () => {
      let y = 0
      function onAnythingSaid(text) {
          // console.log("Said: ", text)
      }
      async function drawShit(text) {
          await board.createText({
              content: text,
              width: 720,
              x: 0,
              y
          })
          y += 15
      }
      function onFinalised(text) {
          console.log("Finalized: ", text)
          drawShit(text)
      }
      function onEndEvent() {
          initSpeechRecgnition()
      }
      function initSpeechRecgnition() {
          runSpeechRecognition(onAnythingSaid, onFinalised, onEndEvent)
      }
      initSpeechRecgnition()
  });
}

init();
