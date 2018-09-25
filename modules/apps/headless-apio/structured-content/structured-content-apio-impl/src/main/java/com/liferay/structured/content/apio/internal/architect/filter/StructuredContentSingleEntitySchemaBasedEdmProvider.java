/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.structured.content.apio.internal.architect.filter;

import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.structured.content.apio.architect.entity.EntityField;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.osgi.service.component.annotations.Component;

/**
 * Provides the entity data model from the Indexed Entity (JournalArticle).
 *
 * @author Julio Camarero
 * @review
 */
@Component(
	immediate = true,
	service = StructuredContentSingleEntitySchemaBasedEdmProvider.class
)
public class StructuredContentSingleEntitySchemaBasedEdmProvider
	extends BaseSingleEntitySchemaBasedEdmProvider {

	@Override
	public Map<String, EntityField> getEntityFieldsMap() {
		return _entityFieldsMap;
	}

	@Override
	public String getName() {
		return "StructuredContent";
	}

	private static final Map<String, EntityField> _entityFieldsMap = Stream.of(
		new EntityField(
			"dateCreated", EntityField.Type.DATE,
			locale -> Field.getSortableFieldName(Field.CREATE_DATE)),
		new EntityField(
			"dateModified", EntityField.Type.DATE,
			locale -> Field.getSortableFieldName(Field.MODIFIED_DATE)),
		new EntityField(
			"datePublished", EntityField.Type.DATE,
			locale -> Field.getSortableFieldName(Field.DISPLAY_DATE)),
		new EntityField(
			"title", EntityField.Type.STRING,
			locale -> Field.getSortableFieldName(
				"localized_title_".concat(LocaleUtil.toLanguageId(locale))))
	).collect(
		Collectors.toMap(EntityField::getName, Function.identity())
	);

}