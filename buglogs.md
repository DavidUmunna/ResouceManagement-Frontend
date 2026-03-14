### [17-06-25]
## comment state bug
# Issue Summary:
While a user was interacting with the request component, it was observed that when a comment was submitted alongside an approval decision, the comment was appropriately recorded. However, an unexpected behavior occurred when the user approved a different request without entering a new comment — the previously entered comment still appeared alongside the new approval decision.

# Root Cause:
Investigation revealed that the comment input was managed using a shared state not scoped to any specific request. As a result, the comment persisted across multiple approvals, causing it to be erroneously attached to unrelated requests. This was a state management issue in which the comment data was stored globally rather than per request.

# Resolution:
The solution involved restructuring the comment state to be an object keyed by request ID. This ensured that each request had its own associated comment in state, preventing comments from "leaking" between requests. With this fix, comments are now correctly submitted and displayed relative to the specific request they were made on.

### [17-06-25]
## image download bug
#Issue Summary:
When attempting to download an image file attached to a request, the downloaded file was empty and unreadable. Initial assumptions pointed to a backend issue, but after detailed debugging, it was discovered that the request never reached the file download endpoint on the server.

# Root Cause:
A closer inspection of the frontend network behavior revealed that the request returned a 404 Not Found error from the Nginx server. With the help of AI tools, it was identified that Nginx interpreted image requests (e.g., .png, .jpg) as static assets, attempting to resolve them from the React build/ directory. Since the image did not exist in that directory, Nginx returned a 404 error before the request could reach the backend.

# Resolution:
The solution involved explicitly modifying the Nginx configuration. A location ^~ /download/ block was added before the static asset matcher to ensure that all download requests, including those for image files, are proxied directly to the backend server without being intercepted by Nginx's static file handling logic.

### [29-06-25]
## fileupload issue while implementing csrfToken 
#Issue Summary:
After implementing CSRF token validation and confirming it worked correctly, an issue arose during a file upload test. The application entered a loading state (`setLoading(true)`) and remained stuck, with the request never reaching the backend endpoint.
## Initial INvestigation:
- Extensive debugging showed no activity on the server side — the request was not hitting the endpoint.
- CSRF validation was completely removed, and JWT tokens were used instead (`httpOnly: false`, standard for SPAs), but the issue persisted.
- This eliminated CSRF as the root cause of the hanging behavior.

---
## Root Cause

- Further inspection revealed that the file used during testing was an **Nginx server configuration file** (essentially a script).
- Uploads of other file types (e.g., images, PDFs, Word documents) worked without any issues.
- This behavior pointed to a problem specific to the **content** or **type** of the file being uploaded.

### Possible Technical Causes

- The script-like content of the file may have triggered browser or security middleware blocks.
- MIME type mismatch or misclassification could have interfered with handling.
- Some server configurations or middlewares may reject certain script types silently.

---

## Resolution Plan

- Re-enable CSRF token validation.
- Avoid using configuration or script files as test files for upload functionality.
- Ensure the backend accepts only whitelisted MIME types:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `application/vnd.oasis.opendocument.text`
- Improve error handling on the frontend to notify users when requests fail silently or hang.
- Add logging to middleware to inspect incoming files before full processing.

---

### [01-06-25]
## cookies not being sent
# issue Summary:
so the cookies that were sent  from the front end which contianed the sessionId were not being sent automatically to the backend when a get request was made or any request at all.

## Root Cause
It all came down to the arrangement of the parameters being sent from the headers to the credentials 

## Resolution
proper arrangement patterns

##Navbar unmounting and remounting
# Issue Summary
I observed that after the refactoring of my routing logic,the navbar kept refreshing everytime a page was changed, this was due to  a useEffect hook in the Navbar kept triggering eventhough there were no dependencies in the array, so it was only meant to run once,
# Root Cause
 the only conclusion was that the whole page kept rerendering which was causing components to unmount and remount, it was not looking good

# Resolution
all forms of animation implementations were moved to the child component(AppLayout) which contained all the routes individually,single responsibility principle was not being followed with respect to animation, whichis meant to only change where the contents are changing 


### [19-07-25]
##  data Update Issue
# Issue summary
so this problems springs from the response modal in development, there is a field on the modal where the staff user can see past responses made by himself tot he admin, then there is also another field like a form where he can make another response and submit, when he does that, the history of responses gets updated, but the problem is after you close the modal, the response badge for that request still reads the previous amount of responses  and does not update

# Root cause
the use of two different states: in the request, the staffresponse field is used directly to reflect the number of responses but when the modal is opened up there is another call to the backend for the past responses because because this state needs to update frequently where as the request state does not update frequently

# Resolution
Sending a Callback as a prop from the parent component 
to the modal once the modal fetches data for past responses it triggers the request list to rerender