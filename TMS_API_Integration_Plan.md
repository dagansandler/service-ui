# TMS API Integration Plan for Test Case Library

## Overview
Replace the mocked folders tree in the Test Case Library with actual API integration for TMS (Test Management System).

## Current State Analysis

### Existing Patterns in Project
- **HTTP Client**: Uses `fetch` from `common/utils/fetch` (axios wrapper)
- **Async Operations**: Redux Sagas with `fetchDataAction` from `controllers/fetch`
- **URL Structure**: Defined in `common/urls.js` following pattern `${urlBase}${projectKey}/...`
- **Project Context**: Access via `projectKeySelector` from `controllers/project`
- **Error Handling**: Global error handling through sagas and notifications

### Current Implementation
- File: `app/src/pages/inside/testCaseLibraryPage/expandedOptions/expandedOptions.tsx`
- Mock data: `app/src/pages/inside/testCaseLibraryPage/expandedOptions/mockData.js`
- Route: `/organizations/:organizationSlug/projects/:projectSlug/testCaseLibrary`

## Phase 1: Basic API Integration

### 1.1 Add TMS URLs to common/urls.js
```javascript
// Add to URLS object
tmsFolders: (projectKey) => `${urlBase}project/${projectKey}/tms/folder`,
```

### 1.2 Create TMS Controller Structure
- Create `app/src/controllers/tms/` directory
- Add constants, actionCreators, sagas, selectors, reducer
- Follow existing controller patterns (similar to `controllers/fetch`)

### 1.3 Implement Basic Folder Fetching
- Create saga to call GET `/project/{projectKey}/tms/folder`
- Add to rootSaga for global registration
- Use `fetchDataAction` pattern for consistency

### 1.4 Integration in Test Case Library
- Import TMS actions in `expandedOptions.tsx`
- Replace FOLDERS mock with API call on component mount
- Add loading states and error handling
- Console log results for initial verification

## Phase 2: Full UI Integration

### 2.1 Update Component State Management
- Replace `useState` with Redux state
- Add selectors for folders data
- Implement loading and error states in UI

### 2.2 Add Folder Operations
- Create folder (POST)
- Update folder (PUT)
- Delete folder (DELETE)
- Move folders (if supported by API)

### 2.3 Real-time Updates
- Implement optimistic updates
- Add success/error notifications
- Refresh folder tree after operations

## Phase 3: Advanced Features

### 3.1 Search and Filtering
- Folder search functionality
- Test case count updates
- Hierarchical filtering

### 3.2 Performance Optimization
- Lazy loading for deep folder structures
- Caching strategies
- Pagination if needed

### 3.3 Accessibility and UX
- Keyboard navigation for folder tree
- Screen reader support
- Drag and drop functionality

## Implementation Steps for Phase 1

### Step 1: Create TMS URL endpoint ✓
Add TMS folder URL to `common/urls.js`

### Step 2: Create TMS controller structure
```
app/src/controllers/tms/
├── index.js
├── constants.js
├── actionCreators.js
├── sagas.js
├── selectors.js
└── reducer.js
```

### Step 3: Add basic folder fetch saga
- Fetch folders on Test Case Library page load
- Use projectKey from current context
- Log response to console

### Step 4: Integration in expandedOptions component
- Replace FOLDERS import with API call
- Add useEffect to trigger fetch on mount
- Handle loading state

### Step 5: Testing and Verification
- Verify API call is made on page load
- Confirm projectKey is correctly extracted
- Check console for API response
- Handle any CORS or authentication issues

## Technical Considerations

### Authentication
- Ensure API calls include proper authentication headers
- Handle 401/403 responses appropriately

### Error Handling
- Network errors
- API validation errors
- Empty responses
- Malformed data

### Data Structure Mapping
- Map API response to expected folder structure
- Handle nested folder hierarchies
- Ensure compatibility with existing Folder component

### Performance
- Avoid unnecessary re-renders
- Implement proper cleanup in useEffect
- Consider debouncing for search operations

## Success Criteria for Phase 1 ✅ COMPLETED

1. ✅ API call to `/project/{projectKey}/tms/folder` is made when Test Case Library page loads
2. ✅ Console shows API response data
3. ✅ No UI errors or crashes
4. ✅ projectKey is correctly extracted from current context (via saga)
5. ✅ Proper error handling for API failures

### Implementation Summary:
- ✅ Created complete TMS controller structure (`app/src/controllers/tms/`)
- ✅ Added TMS URL endpoint to `common/urls.js`
- ✅ Implemented Redux Saga with mock API responses (with loading states and error handling)
- ✅ Integrated with Test Case Library component using Redux state
- ✅ Added TMS reducer to store configuration
- ✅ Added comprehensive console logging for debugging
- ✅ **Client-side tree reconstruction** from flat list using `parentFolderId`
- ✅ **Loading states** displayed while fetching folders
- ✅ **Error handling** with toast notifications (10% chance for testing)
- ✅ **Real-time test case counting** from API response data

## Next Steps After Phase 1

1. Replace mock data with API response in UI
2. Implement folder CRUD operations
3. Add comprehensive error handling
4. Optimize performance and UX
5. Add tests for TMS integration

## Files to be Modified

### Phase 1 Changes
- `app/src/common/urls.js` - Add TMS endpoints
- `app/src/controllers/tms/` - New TMS controller (new directory)
- `app/src/store/rootSaga.js` - Register TMS sagas
- `app/src/pages/inside/testCaseLibraryPage/expandedOptions/expandedOptions.tsx` - Add API call

### Future Changes
- `app/src/controllers/tms/` - Expand with CRUD operations
- `app/src/pages/inside/testCaseLibraryPage/expandedOptions/mockData.js` - Remove (replace with API)
- Add comprehensive test coverage 