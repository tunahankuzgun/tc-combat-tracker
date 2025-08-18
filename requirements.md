# Trench Crusade Combat Tracker - Requirements Specification

## 📌 1. General Description

The Trench Crusade Combat Tracker is a mobile-friendly web application that helps players during tabletop miniature battles to track:
- Warband/unit statistics
- Glory points and Wounds status
- Effects/buffs/debuffs
- Turn order (Agility-based initiative/turn order)

Designed to match Trench Crusade's grimdark atmosphere, providing quick access during gameplay instead of paper or complex spreadsheets.

## 📌 1.1. Application Versions

The application will be available in two versions:

### 🆓 **Free Version (Single Device Mode)**
- **Local-only operation**: No database or server connection required
- **Single device usage**: One person (typically GM) manages the entire game from their device
- **Local storage**: All data stored in browser's local storage
- **Manual management**: GM adds and manages all players' warbands manually
- **Shared screen**: All players view the GM's screen to track game state
- **Offline-first**: Works completely offline
- **Full feature set**: Includes all combat tracking features

### 💰 **Premium Version (Multi-Device Mode)**
- **Real-time synchronization**: Database-backed with live updates
- **Multi-device support**: Each player connects from their own device
- **Room/session system**: GM creates a session, players join via invite
- **Individual control**: Each player can manage their own warband
- **Data persistence**: Games can be saved and resumed later
- **Authentication system**: User accounts and session management
- **Offline capability**: Can work offline with sync when connection restored
- **One-time payment**: Single purchase, no subscription
- **Full feature set**: Same features as free version plus multi-device functionality

## 📌 2. Functional Requirements

### 🔹 User Management

#### **Free Version**
- **No registration required**: Direct access to application
- **Local session only**: Single device, no user accounts

#### **Premium Version**
- **User registration**: Email-based account creation
- **Session management**: GM creates rooms, players join via invitation code/link
- **Authentication**: Secure login and session handling

### 🔹 Trench Crusade Combat Tracker Features

#### **Initiative Tracking (Agility-based)**
- Agility value-based sorting according to Trench Crusade rules
- Enables players to take turns in sequence
- Turn order automatically listed (Agility high to low)
- GM can adjust the order

#### **Warband/Unit Management**
- **Core Stats**: 
  - Wounds (health points), Armour, Movement, Agility
  - Ranged/Melee Attack values
  - Equipment and weapon loadouts
- **Glory Points**: Tracking earned glory points
- **Unit Types**: Trench Pilgrims, Iron Sultanate, Court of the Seven Headed Serpent etc. warband types
- GM can add new units/enemies
- Player can only edit permitted fields of their own warband

#### **Status/Effect Tracking**
- **Trench Crusade Effects**: Game-specific effects like "Pinned", "Blood Drunk", "Terrified", "On Fire"
- **Equipment Effects**: Environmental effects like Gas Mask, Barbed Wire, Trenches
- Automatically decreasing counters at turn end
- Equipment durability and ammunition tracking

#### **Dice Roller (Trench Crusade Specific)**
- D10 dice system (Trench Crusade's main dice system)
- **Failure/Success/Critical** result display
- **Blood Marker** system integration
- Results can be shared in game session

#### **Notes and Combat Log**
- GM can add notes about battle flow
- **Glory Points** earning history
- Combat history is logged (e.g., "Iron Sultan Janissary attacked Trench Pilgrim for 2 Wounds")
- **Blood Marker** tracking and automatic increment

### 🔹 Visualization
- **Turn order display**: Large and clear, easily readable on mobile, grimdark theme
- **Warband cards**: Wounds bar, equipment icons, effect labels
- **Faction colors**: Characteristic color codes for each warband
- **Responsive grid**: Vertical scrolling on phone, horizontal grid on tablet
- **Dark/Gritty UI**: Dark theme suitable for Trench Crusade's war atmosphere

## 📌 3. Technical / Non-Functional Requirements

### 🔹 Technology

#### **Frontend (Both Versions)**
- Next.js 14 (App Router), TailwindCSS (mobile-first UI, dark theme)
- Progressive Web App (PWA) capabilities
- Responsive design for mobile, tablet, and desktop

#### **Free Version Technical Stack**
- **Client-side only**: No backend required
- **Local storage**: Browser's localStorage/IndexedDB for data persistence
- **No authentication**: Direct access to application
- **Offline-first**: Works completely without internet connection

#### **Premium Version Technical Stack**
- **Backend**: Next.js API routes or Node/Express
- **Real-time updates**: WebSocket / Next.js + Socket.IO
- **Database**: Supabase / Firebase (easy auth + real-time) or PostgreSQL + Prisma
- **Authentication**: JWT or Firebase Auth
- **Cloud hosting**: Vercel, Netlify, or similar platform

### 🔹 Performance & UX

#### **Both Versions**
- **Mobile-first design** (360px width first → expansion for tablet/desktop)
- **Zero refresh** (React state management for smooth interactions)
- **Fast interaction** (change Wounds with single click)
- **Preserve grimdark atmosphere**
- **PWA capabilities** (installable, app-like experience)

#### **Free Version Specific**
- **Instant startup** (no loading from server)
- **No network dependencies** (100% offline operation)
- **Local data persistence** (survives browser restart)

#### **Premium Version Specific**
- **Real-time synchronization** (live updates across devices)
- **Offline support with sync** (works offline, syncs when connected)
- **Cloud backup** (data never lost)
- **Preserve grimdark atmosphere**

### 🔹 Security
- Game rooms private by default (only accessible via link/invitation)
- **Authorization**: GM → full control, Player → manage only their own warband
- JWT or Firebase Auth for user authentication

## 📌 4. User Interface Requirements (UI/UX)

### **Free Version UI**
- **Single device interface**: Large, clear display optimized for sharing
- **GM-centric controls**: All management tools accessible to the person operating the device
- **Quick access buttons**: Fast warband/unit selection and modification

### **Premium Version UI**
- **Multi-device interface**: Personalized view for each connected player
- **Role-based UI**: Different interfaces for GM vs Players
- **Session joining**: Simple invite code/link entry

### **Common UI Elements (Both Versions)**
- **Main screen**: Create new Trench Crusade battle / join battle (Premium only)
- **Faction selection**: Trench Pilgrims, Iron Sultanate, etc.
- **Game board**: 
  - **Turn order** at top like timeline (Agility-based)
  - **Warband cards** below (Wounds bar, equipment buff icons)
  - **Glory Points** display
  - **Blood Marker** tracker
- **Mobile Controls**:
  - Large buttons (finger-friendly)
  - Swipe or + / - buttons for increasing/decreasing Wounds
  - **Dark mode** (grimdark atmosphere default)
  - **Minimal UI**: Player shouldn't be distracted during battle

## 📌 5. Monetization & Business Model

### **Free Version**
- **No limitations on features**: Full combat tracking capabilities
- **Local storage only**: No cloud features
- **No user accounts**: Anonymous usage
- **Advertisement-free**: Clean experience

### **Premium Version**
- **One-time payment**: Single purchase, no recurring fees
- **Multi-device capability**: Main value proposition
- **Cloud features**: Data persistence, session sharing
- **Account system**: User profiles and session history

## 📌 6. Future Features (Optional)

- **Data migration**: Import free version data to premium
- **Battlefield grid integration** (trench layouts)
- **PDF/CSV export** (battle report and glory gains)
- **Equipment database** (all Trench Crusade equipment)
- **Faction-specific features** (each faction's special rules)
- **Campaign tracking** (long-term glory and equipment progression)
- **Multi-language support** (Turkish/English)

## 📌 7. Example User Stories

### Free Version User Stories
- "As a GM using the free version, I want to quickly set up a battle on my tablet so my players can gather around and start playing immediately"
- "As a player using the free version, I want to tell the GM my actions so they can update my warband status on their device"
- "As a GM, I want my game data to persist locally so I can continue a battle after closing the browser"

### Premium Version User Stories
- "As a GM using premium version, I want to create a battle session so my players can join from their own devices"
- "As a player with premium version, I want to join my GM's session from my phone so I can manage my own warband"
- "As a player, I want to see real-time updates when other players take actions"
- "As a GM, I want to save our campaign progress so we can continue next week"

### Common User Stories (Both Versions)
- "As a GM, I want to start a new Trench Crusade battle, add warbands, and set turn order based on Agility"
- "As a GM, I want combat logs to be automatically maintained so I can see who earned how much Glory"
- "As a GM, I want Blood Markers to automatically increment"
- "As a player, I want to easily track Wounds changes on my warband"
- "As a player, I want to quickly add equipment effects"
- "As a player, I want to track earned Glory Points"
- "As a player, I want to see my faction's special rules"

### Technical Stories
- "As a user of free version, I want the app to work completely offline so I can play games anywhere"
- "As a user of premium version, I want my data to sync across devices so I can switch between phone and tablet"
- "As a user, I want my data to be automatically saved so I don't lose progress if something goes wrong"
- "As a user, I want the app to load quickly so it doesn't slow down our game session"

## 📌 8. Success Criteria

### Free Version Success Criteria
- Reduces single-device combat management time by at least 50% compared to pen-and-paper tracking
- New users can start a game within 2 minutes without any setup
- Works perfectly offline with no internet dependency
- Stable performance during 4+ hour game sessions on a single device

### Premium Version Success Criteria
- Enables seamless multi-device gameplay experience
- Real-time sync with less than 1-second delay between devices
- Successful session joining rate above 95%
- Positive feedback from groups using multiple devices

### Overall Success Criteria
- Clear value proposition difference between free and premium versions
- User conversion rate from free to premium version
- Maintains usability while preserving grimdark atmosphere
- Positive feedback from both experienced and novice Trench Crusade players
- Positive feedback from both experienced and novice Trench Crusade players
- Maintains usability while preserving grimdark atmosphere