class ServiceRequest {
  final String id;
  final String title;
  final String? description;
  final String? customerId;
  final String priority;
  final String status;
  final String? assignedTo;
  final DateTime? dueDate;
  final String? location;
  final String? serviceType;
  final String? equipmentId;
  final Map<String, dynamic>? warrantyInfo;
  final List<dynamic> attachments;
  final List<String>? notes;
  final String? specialInstructions;
  final DateTime? reportedDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  ServiceRequest({
    required this.id,
    required this.title,
    this.description,
    this.customerId,
    required this.priority,
    required this.status,
    this.assignedTo,
    this.dueDate,
    this.location,
    this.serviceType,
    this.equipmentId,
    this.warrantyInfo,
    this.attachments = const [],
    this.notes,
    this.specialInstructions,
    this.reportedDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      customerId: json['customer_id'],
      priority: json['priority'] ?? 'medium',
      status: json['status'] ?? 'new',
      assignedTo: json['assigned_to'],
      dueDate: json['due_date'] != null ? DateTime.parse(json['due_date']) : null,
      location: json['location'],
      serviceType: json['service_type'],
      equipmentId: json['equipment_id'],
      warrantyInfo: json['warranty_info'] != null 
          ? Map<String, dynamic>.from(json['warranty_info']) 
          : null,
      attachments: json['attachments'] != null 
          ? List<dynamic>.from(json['attachments']) 
          : [],
      notes: json['notes'] != null 
          ? List<String>.from(json['notes']) 
          : null,
      specialInstructions: json['special_instructions'],
      reportedDate: json['reported_date'] != null 
          ? DateTime.parse(json['reported_date']) 
          : null,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'customer_id': customerId,
      'priority': priority,
      'status': status,
      'assigned_to': assignedTo,
      'due_date': dueDate?.toIso8601String(),
      'location': location,
      'service_type': serviceType,
      'equipment_id': equipmentId,
      'warranty_info': warrantyInfo,
      'attachments': attachments,
      'notes': notes,
      'special_instructions': specialInstructions,
      'reported_date': reportedDate?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  ServiceRequest copyWith({
    String? id,
    String? title,
    String? description,
    String? customerId,
    String? priority,
    String? status,
    String? assignedTo,
    DateTime? dueDate,
    String? location,
    String? serviceType,
    String? equipmentId,
    Map<String, dynamic>? warrantyInfo,
    List<dynamic>? attachments,
    List<String>? notes,
    String? specialInstructions,
    DateTime? reportedDate,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ServiceRequest(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      customerId: customerId ?? this.customerId,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      assignedTo: assignedTo ?? this.assignedTo,
      dueDate: dueDate ?? this.dueDate,
      location: location ?? this.location,
      serviceType: serviceType ?? this.serviceType,
      equipmentId: equipmentId ?? this.equipmentId,
      warrantyInfo: warrantyInfo ?? this.warrantyInfo,
      attachments: attachments ?? this.attachments,
      notes: notes ?? this.notes,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      reportedDate: reportedDate ?? this.reportedDate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Durum kontrolü
  bool get isNew => status == 'new';
  bool get isAssigned => status == 'assigned';
  bool get isInProgress => status == 'in_progress';
  bool get isOnHold => status == 'on_hold';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';

  // Öncelik kontrolü
  bool get isLowPriority => priority == 'low';
  bool get isMediumPriority => priority == 'medium';
  bool get isHighPriority => priority == 'high';
  bool get isUrgentPriority => priority == 'urgent';

  // Durum görüntüleme adı
  String get statusDisplayName {
    switch (status) {
      case 'new':
        return 'Yeni';
      case 'assigned':
        return 'Atandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'on_hold':
        return 'Beklemede';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  }

  // Öncelik görüntüleme adı
  String get priorityDisplayName {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Normal';
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      default:
        return priority;
    }
  }
}

class ServiceActivity {
  final String id;
  final String? serviceRequestId;
  final String activityType;
  final String? description;
  final String? performedBy;
  final DateTime? startTime;
  final DateTime? endTime;
  final String status;
  final String? location;
  final Map<String, dynamic>? materialsUsed;
  final double? laborHours;
  final DateTime createdAt;
  final DateTime updatedAt;

  ServiceActivity({
    required this.id,
    this.serviceRequestId,
    required this.activityType,
    this.description,
    this.performedBy,
    this.startTime,
    this.endTime,
    required this.status,
    this.location,
    this.materialsUsed,
    this.laborHours,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ServiceActivity.fromJson(Map<String, dynamic> json) {
    return ServiceActivity(
      id: json['id'] ?? '',
      serviceRequestId: json['service_request_id'],
      activityType: json['activity_type'] ?? '',
      description: json['description'],
      performedBy: json['performed_by'],
      startTime: json['start_time'] != null ? DateTime.parse(json['start_time']) : null,
      endTime: json['end_time'] != null ? DateTime.parse(json['end_time']) : null,
      status: json['status'] ?? 'new',
      location: json['location'],
      materialsUsed: json['materials_used'] != null 
          ? Map<String, dynamic>.from(json['materials_used']) 
          : null,
      laborHours: json['labor_hours']?.toDouble(),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_request_id': serviceRequestId,
      'activity_type': activityType,
      'description': description,
      'performed_by': performedBy,
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'status': status,
      'location': location,
      'materials_used': materialsUsed,
      'labor_hours': laborHours,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class ServiceHistory {
  final String id;
  final String serviceRequestId;
  final String actionType;
  final Map<String, dynamic>? oldValue;
  final Map<String, dynamic>? newValue;
  final String? description;
  final String? createdBy;
  final DateTime createdAt;

  ServiceHistory({
    required this.id,
    required this.serviceRequestId,
    required this.actionType,
    this.oldValue,
    this.newValue,
    this.description,
    this.createdBy,
    required this.createdAt,
  });

  factory ServiceHistory.fromJson(Map<String, dynamic> json) {
    return ServiceHistory(
      id: json['id'] ?? '',
      serviceRequestId: json['service_request_id'] ?? '',
      actionType: json['action_type'] ?? '',
      oldValue: json['old_value'] != null 
          ? Map<String, dynamic>.from(json['old_value']) 
          : null,
      newValue: json['new_value'] != null 
          ? Map<String, dynamic>.from(json['new_value']) 
          : null,
      description: json['description'],
      createdBy: json['created_by'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_request_id': serviceRequestId,
      'action_type': actionType,
      'old_value': oldValue,
      'new_value': newValue,
      'description': description,
      'created_by': createdBy,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
