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

package com.liferay.portal.workflow.kaleo.definition;

import com.liferay.portal.kernel.util.Validator;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * @author Michael C. Han
 */
public class Notification {

	public Notification(
		String name, String description, String executionType, String template,
		String templateLanguage) {

		_name = name;
		_description = description;

		if (Validator.isNotNull(executionType)) {
			_executionType = ExecutionType.parse(executionType);
		}
		else {
			_executionType = ExecutionType.ON_TIMER;
		}

		_template = template;
		_templateLanguage = TemplateLanguage.parse(templateLanguage);
	}

	public void addNotificationType(String notificationType) {
		_notificationTypes.add(NotificationType.parse(notificationType));
	}

	public void addRecipients(Recipient recipient) {
		Set<Recipient> recipients = _recipientsMap.get(
			recipient.getNotificationReceptionType());

		if (recipients == null) {
			recipients = new HashSet<>();
		}

		recipients.add(recipient);

		_recipientsMap.put(
			recipient.getNotificationReceptionType(), recipients);
	}

	@Override
	public boolean equals(Object object) {
		if (this == object) {
			return true;
		}

		if (!(object instanceof Notification)) {
			return false;
		}

		Notification notification = (Notification)object;

		if (Objects.equals(_name, notification._name)) {
			return true;
		}

		return true;
	}

	public String getDescription() {
		return _description;
	}

	public ExecutionType getExecutionType() {
		return _executionType;
	}

	public String getName() {
		return _name;
	}

	public Set<NotificationType> getNotificationTypes() {
		return _notificationTypes;
	}

	public Map<NotificationReceptionType, Set<Recipient>> getRecipientsMap() {
		return _recipientsMap;
	}

	public String getTemplate() {
		return _template;
	}

	public TemplateLanguage getTemplateLanguage() {
		return _templateLanguage;
	}

	@Override
	public int hashCode() {
		return _name.hashCode();
	}

	private final String _description;
	private final ExecutionType _executionType;
	private final String _name;
	private final Set<NotificationType> _notificationTypes = new HashSet<>();
	private final Map<NotificationReceptionType, Set<Recipient>>
		_recipientsMap = new HashMap<>();
	private final String _template;
	private final TemplateLanguage _templateLanguage;

}