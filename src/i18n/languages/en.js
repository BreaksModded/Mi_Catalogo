export const en = {
  // Common/Global
  common: {
    loading: 'Loading...',
    appName: 'My Catalog',
    backToHome: 'Back to home',
    loadMore: 'Load more sections',
    error: 'Error',
    goBack: 'Back to home',
    searching: 'Searching...',
    remove: 'Remove',
    clear: 'Clear',
    sortByRecent: 'Recently added',
    sortByTitle: 'Title A-Z',
    sortByYear: 'Year',
    sortByRating: 'Rating',
    close: 'Close',
    cancel: 'Cancel',
    creating: 'Creating...',
    optional: 'Optional'
  },

  // Status (from TMDb API)
  status: {
    released: 'Released',
    'in production': 'In Production',
    'post production': 'Post Production',
    planned: 'Planned',
    rumored: 'Rumored',
    canceled: 'Canceled',
    cancelled: 'Cancelled',
    ended: 'Ended',
    'returning series': 'Returning Series',
    'pilot': 'Pilot'
  },

  person: {
    full_filmography: 'Full filmography',
    knownFor: 'Known for',
    yourWatchedTitles: 'Your watched titles with this actor',
    born: 'Born'
  },
  // Navbar
  navbar: {
    title: 'My Catalog',
    movies: 'Movies',
    series: 'Series',
    catalog: 'Catalog',
    summary: 'Summary',
    favorites: 'Favorites',
    streaming: {
      errorLoading: 'Could not load streaming availability.',
      platform: 'platform',
      platforms: 'platforms',
      noLink: 'No link',
      showLess: 'Show less',
      seeMore: 'See {{count}} more',
      availabilityByRegion: 'Availability by region',
      notAvailableOnPlatforms: 'Not available on platforms',
      notAvailableInRegion: 'This content is not available on streaming platforms in {{region}}.',
      thisRegion: 'this region',
      tryChangingRegion: 'Try changing to another region above',
      notAvailable: 'Not available',
      noStreamingInfoFound: 'No streaming information found for {{region}}.',
      pricesEstimated: 'Prices are estimated and may vary',
      directLinksOpen: 'Direct links open in corresponding platform',
      availabilityUpdated: 'Availability updated from TMDb',
      priceNotAvailable: 'Price not available'
    },
    pending: 'Pending',
    lists: 'Lists',
    add: '+ Add',
    search: 'Search...',
    openMenu: 'Open menu',
    account: 'Account',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register'
  },

  // Filters
  filters: {
    genres: 'Genres...',
    minYear: 'Min year',
    maxYear: 'Max year',
    minRating: 'Min rating',
    minPersonalRating: 'Min personal rating',
    showFavorites: 'Favorites only',
    showPending: 'Pending only',
    tags: 'Tags',
    orderBy: 'Order by',
    all: 'All',
    year: 'Year:',
    from: 'From',
    to: 'To',
    tmdbRating: 'TMDb Rating',
    myRating: 'My rating',
    min: 'Min',
    max: 'Max',
    date: 'Date',
    myScore: 'My rating',
    tmdbScore: 'TMDb Rating',
    favorites: 'Favorites',
    pending: 'Pending',
    showOnlyFavorites: 'Show only favorites',
    showOnlyPending: 'Show only pending',
    manageTags: 'Manage tags',
    orderOptions: {
      default: 'Default',
      personalRating: 'Personal rating',
      imdbRating: 'TMDb Rating',
      releaseDate: 'Release year',
      title: 'Title'
    }
  },

  // Sections
  sections: {
    home: 'Home',
    movies: 'Movies',
    series: 'Series',
    catalog: 'Catalog',
    favorites: 'Favorites',
    pending: 'Pending',
    lists: 'Lists',
    summary: 'Summary'
  },

  // Home sections
  homeSections: {
    trends: 'Trending',
    recentlyAdded: 'Recently Added',
    action: 'Action',
    crime: 'Crime',
    comedy: 'Comedy',
    adventure: 'Adventure',
    animation: 'Animation',
    horror: 'Horror',
    sciFi: 'Science Fiction',
    drama: 'Drama'
  },

  // Detail Modal
  detailModal: {
    favorite: 'Favorite',
    pending: 'Pending',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    addToPending: 'Add to pending',
    removeFromPending: 'Remove from pending',
    addToList: 'Add to list',
    delete: 'Delete',
    rate: 'Rate',
    personalNote: 'Personal note',
    editNote: 'Edit note',
    saveNote: 'Save',
    cancelNote: 'Cancel',
    noPersonalNotes: 'No personal notes.',
    similar: 'Similar',
    streamingAvailability: 'Available on',
    year: 'Year',
    genre: 'Genre',
    director: 'Director',
    cast: 'Cast',
    synopsis: 'Synopsis',
    status: 'Status',
    tags: 'Tags',
    manage: 'Manage',
    cancel: 'Cancel',
    originalTitle: 'Original title',
    originalLanguage: 'Original language',
    genres: 'Genres',
    country: 'Country',
    duration: 'Duration',
    budget: 'Budget',
    revenue: 'Revenue',
    seasonsAndEpisodes: 'Seasons and episodes',
    episodes: 'episodes',
    loadingAdvancedDetails: 'Loading advanced TMDb details...',
    personalNotes: 'Personal notes',
    edit: 'Edit',
    personalNotesPlaceholder: 'Write your personal notes about this title here...',
    streamingAvailabilityTitle: 'Streaming availability:',
    loading: 'Loading...',
    subscription: 'Subscription:',
    rental: 'Rental:',
    purchase: 'Purchase:',
    notAvailableOnPlatforms: 'Not available on known platforms.',
    trailer: 'Trailer',
    youtubeTrailer: 'YouTube Trailer',
    noTrailerAvailable: 'No trailer available for this title.',
    couldNotExtractVideo: 'Could not extract YouTube video.',
    searchingMatches: 'Searching for matches in database…',
    noSimilarTitles: 'No similar titles found in your personal catalog. This carousel will update automatically when you add more movies and series with similar genres or themes.',
    couldNotLoadSimilar: 'Could not load similar titles.',
    listsUpdated: 'Lists updated!',
    deleteConfirmTitle: 'Are you sure you want to delete this',
    deleteConfirmMessage: 'Are you sure you want to delete this {tipo} from your catalog?',
    deleteFromDatabase: 'from the database?',
    tag: 'Tag',
    addFirstTag: 'Add first tag',
    searchTags: 'Search tags...',
    noTagsFound: 'No tags match',
    selected: 'Selected',
    showLess: 'Show less',
    more: 'more',
    rating: 'Rating',
    personalRating: 'My rating',
    imdbRating: 'TMDb',
    notAvailable: 'Not available',
    additionalInfo: 'Additional information',
    addNotes: 'Add',
    noNotesYet: 'No notes yet',
    clickToAdd: 'Click to add',
    manageTags: 'Manage Tags'
  },

  // Countries
  countries: {
    spain: 'Spain',
    unitedStates: 'United States',
    unitedKingdom: 'United Kingdom',
    france: 'France',
    germany: 'Germany',
    italy: 'Italy',
    portugal: 'Portugal',
    brazil: 'Brazil',
    mexico: 'Mexico',
    argentina: 'Argentina',
    canada: 'Canada',
    australia: 'Australia',
    japan: 'Japan',
    southKorea: 'South Korea'
  },

  // Streaming
  streaming: {
    errorLoading: 'Could not get streaming availability.',
    platform: 'platform',
    platforms: 'platforms',
    noLink: 'No link',
    showLess: 'Show less',
    seeMore: 'See {{count}} more',
    availabilityByRegion: 'Availability by region',
    notAvailableOnPlatforms: 'Not available on platforms',
    notAvailableInRegion: 'This content is not available on streaming platforms in {{region}}.',
    thisRegion: 'this region',
    tryChangingRegion: 'Try changing to another region above',
    notAvailable: 'Not available',
    noStreamingInfoFound: 'No streaming information found for {{region}}.',
    pricesEstimated: 'Prices are estimated and may vary',
    directLinksOpen: 'Direct links open in the corresponding platform',
    availabilityUpdated: 'Availability updated from TMDb',
    priceNotAvailable: 'Price not available'
  },

  // Errors
  errors: {
    mediaNotFound: 'Media not found',
    couldNotLoadTmdbDetails: 'Could not load advanced TMDb details',
    couldNotLoadSimilar: 'Could not load similar titles.',
    errorSaving: 'Error saving',
    errorSavingNotes: 'Error saving notes. Please try again.'
  },

  // Buttons and actions
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    close: 'Close',
    loadMore: 'Load more',
    showMore: 'Show more',
    loading: 'Loading...',
    loadingWorstRated: 'Loading worst rated content...',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    confirm: 'Confirm',
    backToHome: 'Back to home'
  },

  // Tooltips
  tooltips: {
    tmdbRating: 'TMDb Rating',
    personalRating: 'My Rating',
    noPersonalRating: 'No personal rating'
  },

  // Database sleep notice
  databaseSleep: {
    title: 'Database in sleep mode',
    description: 'The Supabase database is in sleep mode. This is normal behavior on the free plan. It may take up to 30-60 seconds to wake up the first time it\'s used after a period of inactivity.'
  },

  // Messages
  messages: {
    noResults: 'No results found',
    noMoreContent: 'No more content to load',
    applyingFilters: 'Applying filters...',
    searching: 'Searching...',
    searchingContent: 'Searching for content matching',
    noResultsFor: 'No movies or series match',
    tryChangingFilters: 'Try changing or removing some filters to see more results.',
    error: 'Error',
    success: 'Success',
    translating: 'Translating content',
    translationError: 'Error translating content',
    contentTranslated: 'Content automatically translated',
    // New notification messages
    searchingWithFilters: 'Searching for content matching your filters...',
    noMoviesFound: 'No movies found with the selected filters',
    noSeriesFound: 'No series found with all selected genres',
    errorLoadingMovies: 'Error loading movies',
    errorLoadingSeries: 'Error loading series',
    noMoreMovies: 'No more movies to load',
    errorFiltering: 'Error filtering data',
    mediaDeleted: 'Media deleted successfully',
    errorDeletingMedia: 'Error deleting movie or series',
    mediaAdded: 'added successfully',
    errorUpdatingInterface: 'Error updating interface after adding',
    connectionError: 'Connection error',
    // Related media messages
    searchingRelated: 'Searching for related titles...',
    errorLoadingRelated: 'Could not load related titles',
    // List messages
    searchingInList: 'Searching...',
    // Chart messages
    noData: 'No data available'
  },

  // Translation status
  translation: {
    translating: 'Translating content...',
    tmdbSource: 'Translated from TMDb',
    localSource: 'Local translation',
    originalSource: 'Original content'
  },

  // Summary page
  summary: {
    title: 'My Movie Collection: Summary',
    totals: 'Totals',
    moviesWatched: 'Movies watched',
    seriesWatched: 'Series watched',
    averageRating: 'Average rating',
    outstandingStats: 'Outstanding stats',
    mostWatchedGenre: 'Most watched genre',
    bestRatedGenre: 'Best rated genre',
    top5: 'Top 5',
    movies: 'Movies',
    series: 'Series',
    worstRated: 'Worst rated',
    noRatedMovies: 'No rated movies.',
    noRatedSeries: 'No rated series.',
    collaboration: 'collaboration',
    collaborations: 'collaborations',
    work: 'work',
    works: 'works',
    recentActivity: 'Recent activity',
    genreDistribution: 'Genre distribution',
    yearlyChart: 'Titles watched by release year',
    topActorsDirectors: 'Top most frequent actors and directors',
    actors: 'Actors',
    directors: 'Directors',
    noData: 'No data available',
    loadingData: 'Loading your movie collection summary...',
    errorLoading: 'Error loading totals',
    backendNotConfigured: 'Backend URL is not configured.',
    retry: 'Retry'
  },

  // Lists
  lists: {
    title: 'Lists',
    createNew: 'Create new list',
    createList: 'Create list',
    name: 'List name',
    description: 'Description (optional)',
    placeholder: 'List name',
    descriptionPlaceholder: 'Description (optional)',
    create: 'Create',
    reload: 'Reload lists',
    noLists: 'You haven\'t created any lists yet.',
    items: 'items',
    confirmDelete: 'Delete list?',
    confirmDeleteMessage: 'Are you sure you want to delete the list',
    deleteWarning: 'This action cannot be undone.',
    deleteButton: 'Delete',
    cancelButton: 'Cancel',
    deleteTitle: 'Delete list',
    nameRequired: 'Name is required',
    errorCreating: 'Could not create the list',
    errorDeleting: 'Could not delete the list',
    errorCreatingGeneric: 'Error creating the list',
    // Modal específico
    manageListsTitle: 'Manage Lists',
    yourLists: 'Your Lists',
    errorLoadingLists: 'Error loading lists',
    addedToList: 'Added to list',
    removedFromList: 'Removed from list',
    errorUpdatingList: 'Error updating list',
    listCreated: 'List created successfully!',
    errorCreatingList: 'Error creating list',
    titles: 'titles',
    addToList: 'Add to list',
    removeFromList: 'Remove from list',
    add: 'Add',
    remove: 'Remove',
    noListsYet: 'No lists yet',
    createFirstList: 'Create your first list to organize your catalog',
    createNewList: 'Create New List',
    listName: 'List name',
    listNamePlaceholder: 'E.g. Favorite movies',
    listDescription: 'Description',
    listDescriptionPlaceholder: 'Optional list description',
    // List details modal
    searchPlaceholder: 'Search your catalog to add...',
    searchButton: 'Search',
    addButton: 'Add',
    emptyList: 'This list is empty.',
    searchError: 'Search error',
    noResultsInCatalog: 'No results found in your catalog',
    searchCatalogError: 'Could not search your catalog',
    errorAddingToList: 'Could not add to list',
    // View choice modal
    howToView: 'How would you like to view this list?',
    viewAsPage: 'View as Page',
    pageDescription: 'Full page experience with search and content management',
    viewAsModal: 'View as Modal',
    modalDescription: 'Quick view overlay for browsing',
    viewTip: 'You can change this preference anytime',
    // List page
    searchResults: 'Available to add',
    alreadyAdded: 'Already in list',
    emptyListDesc: 'This list is empty. Use the search above to add movies and TV shows.',
    // List page specific
    backToCatalog: 'Back to lists',
    breadcrumbCatalog: 'Catalog',
    breadcrumbLists: 'Lists',
    titles: 'Titles',
    created: 'Created',
    addToList: 'Add to list',
    alreadyInList: 'Already in list',
    sortBy: 'Sort by',
    searching: 'Searching...',
    noResults: 'No titles found in your catalog',
    emptyList: 'This list is empty',
    contentOfList: 'List content',
    // Edit mode
    editList: 'Edit list',
    finishEditing: 'Finish editing',
    enterEditMode: 'Enter edit mode',
    exitEditMode: 'Exit edit mode',
    editingList: 'Editing list',
    editInstructions: 'Drag items to reorder and use the delete button to remove titles',
    removeFromList: 'Remove from list',
    sortByPersonal: 'Custom order'
  },

  // Tags
  tags: {
    createTag: 'Create Tag',
    deleteMode: 'Delete Mode',
    deleteSelected: 'Delete Selected',
    confirmDelete: 'Will delete',
    permanently: 'tags permanently.',
    nameRequired: 'Tag name cannot be empty',
    nameExists: 'A tag with that name already exists',
    tagNamePlaceholder: 'New tag name',
    existingTags: 'Existing Tags',
    selected: 'Selected',
    confirmTitle: 'Are you sure?',
    // Added operation result messages
    created: 'Tag created successfully',
    createFailed: 'Could not create tag',
    deleteFailed: 'Could not delete tags',
    addFailed: 'Could not add tag',
    removeFailed: 'Could not remove tag'
  },

  // Add Media Form
  addMedia: {
    title: 'Add Movie or Series',
    searchPlaceholder: 'Search on TMDb...',
    searchButton: 'Search TMDb',
    noResults: 'No results found',
    addToLibrary: 'Add to library',
    chooseCorrectOption: 'Choose the correct option:',
    noValidOptions: 'No valid options found.',
    connectionError: 'Connection error',
    notFound: 'Not found',
    // Form fields
    titleField: 'Title',
    originalTitleField: 'Original / English title',
    yearField: 'Year',
    genreField: 'Genre',
    typeField: 'Type (Movie or Series)',
    directorField: 'Director',
    castField: 'Main cast',
    imageField: 'Image URL',
    tmdbIdField: 'TMDb ID',
    seasonsField: 'Seasons (series only)',
    episodesField: 'Episodes (series only)',
    personalRatingField: 'Personal rating (0-10)',
    synopsisField: 'Synopsis',
    statusField: 'Status (watched, pending, etc.)',
    tmdbRatingLabel: 'TMDb Rating:',
    manageTags: 'Manage Tags',
    addButton: 'Add',
    // Validation messages
    titleRequired: 'Title is required',
    invalidYear: 'Year is not valid',
    invalidRating: 'Personal rating must be between 0 and 10',
    // Existence checks
    movieExistsInCatalog: 'This movie already exists in your catalog',
    seriesExistsInCatalog: 'This series already exists in your catalog',
    movieNotInCatalog: 'This movie does not exist in your catalog',
    seriesNotInCatalog: 'This series does not exist in your catalog',
    checkingExistence: 'Could not check existence',
    // Success/Error messages
    movieAddedSuccess: 'Movie added successfully',
    seriesAddedSuccess: 'Series added successfully',
    errorUpdatingInterface: 'Error updating interface after adding',
    unexpectedError: 'Unexpected error.',
    duplicateEntry: 'An entry with this TMDb ID already exists in your catalog.',
    duplicateMessage: 'You already have',
    inCatalog: 'in your catalog.',
    errorAdding: 'Error adding',
    tagCreatedSuccess: 'Tag created successfully',
    errorCreatingTag: 'Error creating tag',
    tagDeletedSuccess: 'Tag deleted successfully',
    errorDeletingTag: 'Error deleting tag',
    votes: 'votes',
    similarTitles: 'Similar - You might have also watched',
    noTitle: 'No title',
    unknownYear: 'Unknown year',
    notAvailable: 'Not available'
  },

  // Form fields
  form: {
    title: 'Title',
    year: 'Year',
    genre: 'Genre',
    type: 'Type',
    movie: 'Movie',
    series: 'Series',
    rating: 'Rating',
    personalRating: 'My rating',
    notes: 'Notes',
    required: 'Required',
    optional: 'Optional'
  },

  // General terms
  general: {
    title: 'Title',
    titles: 'Titles',
    movie: 'Movie',
    movies: 'Movies',
    series: 'Series',
    seasons: 'Seasons',
    episodes: 'Episodes',
    year: 'Year',
    years: 'Years',
    genre: 'Genre',
    genres: 'Genres',
    rating: 'Rating',
    favorite: 'Favorite',
    favorites: 'Favorites',
    pending: 'Pending',
    watched: 'Watched',
    notWatched: 'Not Watched'
  },

  // Genres translations
  genres: {
    'acción': 'Action',
    'action': 'Action',
    'aventura': 'Adventure',
    'adventure': 'Adventure',
    'comedia': 'Comedy',
    'comedy': 'Comedy',
    'drama': 'Drama',
    'terror': 'Horror',
    'horror': 'Horror',
    'thriller': 'Thriller',
    'suspense': 'Suspense',
    'ciencia ficción': 'Science Fiction',
    'science fiction': 'Science Fiction',
    'sci-fi': 'Science Fiction',
    'fantasía': 'Fantasy',
    'fantasy': 'Fantasy',
    'romance': 'Romance',
    'romántica': 'Romance',
    'animación': 'Animation',
    'animation': 'Animation',
    'documental': 'Documentary',
    'documentary': 'Documentary',
    'crimen': 'Crime',
    'crime': 'Crime',
    'misterio': 'Mystery',
    'mystery': 'Mystery',
    'guerra': 'War',
    'war': 'War',
    'bélica': 'War',
    'belica': 'War',
    'western': 'Western',
    'musical': 'Musical',
    'biografía': 'Biography',
    'biography': 'Biography',
    'historia': 'History',
    'history': 'History',
    'familia': 'Family',
    'family': 'Family',
    'deporte': 'Sport',
    'sport': 'Sport',
    'música': 'Music',
    'music': 'Music'
  },

  // Welcome screen
  welcome: {
    title: 'Welcome to Your Personal Catalog',
    subtitle: 'Create and manage your personal collection of movies and series',
    feature1: 'Personal Catalog',
    feature1Desc: 'Organize your favorite movies and series',
    feature2: 'Custom Tags',
    feature2Desc: 'Tag and categorize your content',
    feature3: 'Favorites and Notes',
    feature3Desc: 'Mark favorites and add annotations',
    getStarted: 'Get Started!',
    loginPrompt: 'Sign in to access your personal catalog and start adding movies and series'
  },

  // Empty state for authenticated users with no content
  emptyState: {
    title: 'Welcome to your personal catalog!',
    subtitle: 'You\'re about to create your perfect collection of movies and series. We\'ll guide you step by step.',
    guideTitle: 'How to get started? It\'s very easy:',
    
    step1Title: 'Add your first movie or series',
    step1Desc: 'Click the green "Add" button in the top bar and search for any title you\'ve watched or want to watch.',
    
    step2Title: 'Customize your experience',
    step2Desc: 'Mark as favorite, give it a personal rating, add custom tags and organize your content as you prefer.',
    
    step3Title: 'Enjoy your catalog',
    step3Desc: 'Explore statistics, discover trends, manage your watchlist and never forget what you\'ve watched.',
    
    feature1Title: 'Advanced Statistics',
    feature1Desc: 'Detailed charts of your favorite genres, average ratings and viewing trends.',
    
    feature2Title: 'Smart Tags',
    feature2Desc: 'Create custom tags to organize your content: "Classics", "Weekend movies", etc.',
    
    feature3Title: 'Favorites System',
    feature3Desc: 'Mark your favorite titles and give them personal ratings to remember what you liked most.',
    
    feature4Title: 'Cross-platform',
    feature4Desc: 'Access your catalog from any device. Your data always synced and secure.',
    
    addFirstTitle: 'Add my first movie/series',
    addFirstHint: 'It will only take a few seconds and you\'ll immediately see how your personal catalog works.',
    
    tipsTitle: 'Professional tips:',
    tip1: 'You can import lists from other services or add content in bulk.',
    tip2: 'Use advanced search with filters by genre, year, rating or custom tags.',
    tip3: 'Your catalog automatically updates with information from TMDb.'
  },

  // Authentication
  auth: {
    // Títulos y subtítulos
    loginTitle: 'Sign In',
    registerTitle: 'Create Account',
    forgotPasswordTitle: 'Reset Password',
    loginSubtitle: 'Access your personal catalog',
    registerSubtitle: 'Join our film community',
    forgotPasswordSubtitle: 'Enter your email or username and we\'ll send you a link to reset your password',
    
    // Pasos del registro
    step1Title: 'Basic Information',
    step2Title: 'Personal Information',
    step2Subtitle: 'Tell us a bit about yourself',
    step3Title: 'Entertainment Preferences',
    step3Subtitle: 'Help us personalize your experience',
    step4Title: 'Additional Information',
    step4Subtitle: 'This data helps us create better statistics',
    
    // Campos del formulario
    email: 'Email',
    emailOrUsername: 'Email or username',
    username: 'Username',
    password: 'Password',
    repeatPassword: 'Repeat password',
    name: 'First Name',
    lastName: 'Last Name',
    birthDate: 'Date of birth',
    country: 'Country',
    preferredLanguage: 'Preferred language',
    favoriteGenres: 'Favorite genres',
    streamingPlatforms: 'Streaming platforms you use',
    contentType: 'Preferred content type',
    occupation: 'Occupation',
    educationLevel: 'Education level',
    
    // Opciones
    movies: 'Movies',
    series: 'Series',
    both: 'Both',
    
    // Placeholders
    emailPlaceholder: 'you@email.com',
    emailOrUsernamePlaceholder: 'you@email.com or your_username',
    usernamePlaceholder: 'username',
    passwordPlaceholder: '••••••••',
    namePlaceholder: 'Your first name',
    lastNamePlaceholder: 'Your last name',
    
    // Botones
    login: 'Sign In',
    register: 'Create Account',
    next: 'Next',
    previous: 'Previous',
    sendRecoveryLink: 'Send recovery link',
    sending: 'Sending...',
    loading: 'Loading...',
    
    // Enlaces
    noAccount: 'Don\'t have an account? Sign up',
    hasAccount: 'Already have an account? Sign in',
    forgotPassword: 'Forgot your password?',
    backToLogin: '← Back to sign in',
    
    // Estados del username
    usernameChecking: 'Checking availability...',
    usernameAvailable: '✓ Username available',
    usernameNotAvailable: '✗ Username not available',
    usernameHelp: 'This will be your public name. Only letters, numbers, hyphens, dots and underscores.',
    
    // Privacidad
    privacyTitle: 'Privacy Settings',
    shareStats: 'Share my statistics anonymously to improve the platform',
    publicProfile: 'Make my profile public (other users can see my lists and ratings)',
    
    // Mensajes de error
    emailRequired: 'Email or username is required',
    emailInvalid: 'Valid email is required',
    usernameRequired: 'Username must be at least 3 characters',
    usernameTooLong: 'Username cannot be more than 50 characters',
    usernameInvalidChars: 'Username can only contain letters, numbers, hyphens, underscores and dots',
    usernameNotAvailableError: 'This username is already taken',
    usernameVerifying: 'Checking availability...',
    passwordRequired: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    nameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    birthDateRequired: 'Date of birth is required',
    tooYoung: 'You must be at least 13 years old',
    countryRequired: 'Country is required',
    genresRequired: 'You must select at least one favorite genre',
    contentTypeRequired: 'You must select a preferred content type',
    usernameCheckError: 'Error checking username',
    invalidCredentials: 'Invalid credentials',
    userNotFound: 'User not found',
    registerError: 'Registration error',
    recoveryError: 'Error sending recovery request',
    
    // Mensajes de éxito
    registerSuccess: 'Registration successful! You can now sign in.',
    
    // Progreso
    step: 'Step {{current}} of {{total}}',
    
    // Selectores
    selectCountry: 'Select your country',
    selectOccupation: 'Select your occupation',
    selectEducation: 'Select your education level',
    
    // Países
    countries: {
      spain: 'Spain',
      mexico: 'Mexico',
      argentina: 'Argentina',
      colombia: 'Colombia',
      chile: 'Chile',
      peru: 'Peru',
      venezuela: 'Venezuela',
      ecuador: 'Ecuador',
      bolivia: 'Bolivia',
      paraguay: 'Paraguay',
      uruguay: 'Uruguay',
      costaRica: 'Costa Rica',
      panama: 'Panama',
      guatemala: 'Guatemala',
      honduras: 'Honduras',
      elSalvador: 'El Salvador',
      nicaragua: 'Nicaragua',
      dominicanRepublic: 'Dominican Republic',
      cuba: 'Cuba',
      puertoRico: 'Puerto Rico',
      usa: 'United States',
      canada: 'Canada',
      brazil: 'Brazil',
      france: 'France',
      italy: 'Italy',
      germany: 'Germany',
      uk: 'United Kingdom',
      portugal: 'Portugal',
      other: 'Other'
    },
    
    // Géneros
    genres: {
      action: 'Action',
      adventure: 'Adventure',
      animation: 'Animation',
      biography: 'Biography',
      comedy: 'Comedy',
      crime: 'Crime',
      documentary: 'Documentary',
      drama: 'Drama',
      family: 'Family',
      fantasy: 'Fantasy',
      history: 'History',
      horror: 'Horror',
      music: 'Music',
      mystery: 'Mystery',
      romance: 'Romance',
      sciFi: 'Science Fiction',
      sport: 'Sport',
      thriller: 'Thriller',
      war: 'War',
      western: 'Western',
      musical: 'Musical',
      noir: 'Noir'
    },
    
    // Plataformas
    platforms: {
      netflix: 'Netflix',
      primeVideo: 'Prime Video',
      disneyPlus: 'Disney+',
      hboMax: 'HBO Max',
      appleTv: 'Apple TV+',
      paramount: 'Paramount+',
      hulu: 'Hulu',
      peacock: 'Peacock',
      discovery: 'Discovery+',
      crunchyroll: 'Crunchyroll',
      filmin: 'Filmin',
      movistar: 'Movistar+',
      skyShowtime: 'SkyShowtime',
      other: 'Other'
    },
    
    // Ocupaciones
    occupations: {
      student: 'Student',
      employee: 'Employee',
      entrepreneur: 'Entrepreneur',
      freelancer: 'Freelancer',
      retired: 'Retired',
      unemployed: 'Unemployed',
      homemaker: 'Homemaker',
      healthcare: 'Healthcare Professional',
      educator: 'Educator',
      engineer: 'Engineer',
      artist: 'Artist',
      technology: 'Technology',
      services: 'Services',
      commerce: 'Commerce',
      industry: 'Industry',
      other: 'Other'
    },
    
    // Niveles de educación
    education: {
      primary: 'Primary Education',
      secondary: 'Secondary Education',
      highSchool: 'High School',
      vocational: 'Vocational Training',
      university: 'University Studies',
      masters: 'Master\'s Degree',
      doctorate: 'Doctorate',
      other: 'Other'
    },
    
    // Password reset
    invalidToken: 'Invalid or missing recovery token',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    resetError: 'Error resetting password',
    passwordResetSuccess: 'Password reset successful!',
    passwordUpdateSuccess: 'Your password has been updated successfully.',
    redirectingMessage: 'You will be redirected to home in a few seconds...',
    resetPasswordTitle: 'Reset Password',
    resetPasswordSubtitle: 'Enter your new password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    resetPasswordButton: 'Reset Password',
    updating: 'Updating...'
  },

  // Email templates
  email: {
    passwordReset: {
      subject: 'Password Recovery - My Catalog',
      title: '🎬 My Catalog',
      subtitle: 'Password Recovery',
      greeting: 'Hello {username}',
      message: 'We have received a request to reset the password for your My Catalog account.',
      instruction: 'To create a new password, click on the following link:',
      buttonText: 'Reset Password',
      alternativeText: 'If you cannot click the button, copy and paste the following link into your browser:',
      expirationWarning: 'This link will expire in 24 hours for security.',
      noRequestWarning: 'If you did not request this change, you can ignore this email. Your password will not be modified.',
      thanks: 'Thank you for using My Catalog!',
      footer: 'This is an automated email, please do not reply to this message.'
    }
  }
};
