This folder contains email templates that are in use by OMS service.

These email templates are not used by the OMS service code. Rather, they need to be added to the notification service
DB via an API call. We are checking them in here so that we don't lose track of them.

These need to be added to notification service via the `POST /api/v1/templates` API. The template content needs to be sent in the request body, preferably in a minified
format for convenience.
