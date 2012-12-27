OneMaps
=======

One Map with multiple web browserS

## Movies

- http://youtu.be/FKgEcHGOZOk
- http://youtu.be/L5NxefoO0qY

## Installation

Install npm.

```bash
sudo apt-get install git npm # Ubuntu 12.04
sudo apt-get install git npm nodejs-legacy # Ubuntu 12.10
```

Clone the repository.

```bash
git clone https://github.com/taroyabuki/OneMaps.git
```

Install dependent libraries. To run on [AppFog](https://www.appfog.com/), you should install libraries before `af update`.

```bash
cd OneMaps
npm install
```

## Running

```bash
node server.js
```

Request `http://localhost:3000/` from web browsers.

### PaaS

[Heroku](https://www.heroku.com/) and [AppFog](https://www.appfog.com/) are tested.

## Licence

Copyright 2012 Taro YABUKI

Licensed under the GNU General Public License, Version 3.0.
See COPYING for more details.

OneMaps is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

OneMaps is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with OneMaps. If not, see <http://www.gnu.org/licenses/>.
