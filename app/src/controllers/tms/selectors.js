/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const tmsSelector = (state) => state.tms || {};
export const tmsLoadingSelector = (state) => tmsSelector(state).loading || false;

// The fetchReducer with contentPath: 'content' already extracts the content array
// So state.tms.folders is already the array of folders, not the full response object
export const tmsFoldersSelector = (state) => {
  const folders = tmsSelector(state).folders || [];
  return folders;
};

// Build tree structure from flat list using parentFolderId and transform to expected format
export const transformedFoldersSelector = (state) => {
  const folders = tmsFoldersSelector(state);

  // Create a map for quick lookup
  const folderMap = new Map();

  // First pass: Create all folder objects
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      name: folder.name,
      testsCount: folder.countOfTestCases || 0,
      description: folder.description,
      id: folder.id,
      parentFolderId: folder.parentFolderId,
      folders: [], // Will be populated in second pass
    });
  });

  // Second pass: Build the tree structure
  const rootFolders = [];

  folders.forEach((folder) => {
    const transformedFolder = folderMap.get(folder.id);

    if (folder.parentFolderId === null || folder.parentFolderId === undefined) {
      // This is a root folder
      rootFolders.push(transformedFolder);
    } else {
      // This is a child folder, add it to its parent
      const parentFolder = folderMap.get(folder.parentFolderId);
      if (parentFolder) {
        parentFolder.folders.push(transformedFolder);
      } else {
        // Parent not found, treat as root folder (shouldn't happen with good data)
        console.warn(
          `Parent folder with ID ${folder.parentFolderId} not found for folder ${folder.name}`,
        );
        rootFolders.push(transformedFolder);
      }
    }
  });

  return rootFolders;
};
