# Requirements Document

## Introduction

小説詳細ページにおいて、現在表示されていないsummary（あらすじ）をタイトルの下、エピソード一覧の上に表示する機能を追加します。これにより、ユーザーは小説の内容を事前に把握でき、読み始めるかどうかの判断材料として活用できます。

## Requirements

### Requirement 1

**User Story:** As a reader, I want to see the novel's summary on the detail page, so that I can understand what the story is about before reading.

#### Acceptance Criteria

1. WHEN a user visits a novel detail page THEN the system SHALL display the novel's summary between the title and episode list
2. IF a novel has a summary THEN the system SHALL render the summary text with proper formatting
3. IF a novel does not have a summary THEN the system SHALL display a placeholder message or hide the summary section

### Requirement 2

**User Story:** As a reader, I want the summary to be clearly distinguishable from other content, so that I can quickly identify and read it.

#### Acceptance Criteria

1. WHEN the summary is displayed THEN the system SHALL use appropriate styling to distinguish it from the title and episode list

### Requirement 3

**User Story:** As a reader, I want the summary to be responsive across different devices, so that I can read it comfortably on any screen size.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN the summary SHALL be properly formatted and readable
2. WHEN viewing on desktop devices THEN the summary SHALL utilize appropriate spacing and typography