# We never decided on the name of the voice assistant

### Installation and Running

Currently the voice kit only works on Google Chrome.

1. You need to clone the repository to your local machine and change directory to the repository folder

2. Then run npm -install to download the necessary dependencies

3. Then run npm start  – you now have a local copy of the app running on port 3000

4. Open Miro in Chrome and install the app in your dev space

5. Open a Miro board and turn on the voice assistant in the apps tab of the menu

### Available Commands

We have created some fun commands for you to shout at your Miro board:

- <create %object_name%>: creates a block with your specified name on your screen
- <find %object_name%>: moves the screen to be centered around specified object
- <delete %object_name%>: removes an object with specified name
- <annotate %new_object_name%>: changes text in selected blocks to specified phrase
- <say %message%>: displays your voice message via speech bubble on your Miro board.
- <align> : aligns selected objects and spaces them out evenly
- <link>: creates arrows between selected objects, pointing from
- <paint %object_name% %color_name%>: changes the color of specified object to specified color
- <remove color %color_name%>: removes all objects of specified color from board
- <like/dislike %object_name%>: adds a like/dislike symbol to an object you specify
- <show everything>: zooms out the board so that all elements of board are shown on screen
- <destroy everything>: deletes every single object on the board

Miscellaneous commands that you probably won't use, but we like them nonetheless:
- <decorate %object_name%>: highlights specified object with a frame of pretty flowers
- <remove decorations>: removes all the pretty flowers from board
- <spawn cat>: inserts a janky animation of a walking cat
- <remove cat>: removes all janky animations of walking cats

There are also some undocumented commands which we encourage you to discover on your own :)
