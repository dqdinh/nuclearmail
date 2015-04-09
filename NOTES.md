Utils:
- ./utils/styleSet -- compact and merge array of style objects
- ./utils/C

Patterns:
- Flow type annotations
- Client auth checks using an external API
- API call wrapper in ./api/API
- pub/sub structure also in ./api/API
- cool use of map to make Nav buttons -
- Caching w/ localstore

Experimental:
- Cesium & inline styles using js -- Mix and match? (may not need inline js
  styles unless UI component is complex e.g., recomputes based on window size
  but CSS already has media queries. The main adv might just more integrated
  ease of logical css)
  - I think you can just replace Cesium with sx e.g., in the Nav component but 
