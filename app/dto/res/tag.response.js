class TagResponseDto {
  constructor(
    id,
    name,
    displayName,
    questionCount,
    createdAt,
    updatedAt,
    description
  ) {
    this.id = id;
    this.name = name;
    this.displayName = displayName;
    this.questionCount = questionCount || 0;
    this.description = description || '';
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;
  }

  // Create from Tag model
  static fromTag(tagData) {
    return new TagResponseDto(
      tagData._id,
      tagData.name,
      tagData.displayName,
      tagData.questionCount,
      tagData.createdAt,
      tagData.updatedAt,
      tagData.description
    );
  }

  // Create list from Tag models
  static fromTagList(tagList) {
    if (!tagList || !Array.isArray(tagList)) {
      return [];
    }
    return tagList.map((tag) => TagResponseDto.fromTag(tag));
  }

  // Create for autocomplete (simplified)
  static forAutocomplete(tagData) {
    return {
      id: tagData._id,
      name: tagData.name,
      displayName: tagData.displayName,
      questionCount: tagData.questionCount,
      description: tagData.description,
    };
  }
}

module.exports = TagResponseDto;
