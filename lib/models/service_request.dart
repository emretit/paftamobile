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
  // Servis fişi alanları
  final String? slipNumber;
  final DateTime? issueDate;
  final DateTime? completionDate;
  final String? technicianName;
  final String? technicianSignature;
  final Map<String, dynamic>? customerData;
  final Map<String, dynamic>? equipmentData;
  final Map<String, dynamic>? serviceDetails;
  final String? slipStatus;
  final String? serviceNumber;
  final String? customerName;

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
    // Servis fişi alanları
    this.slipNumber,
    this.issueDate,
    this.completionDate,
    this.technicianName,
    this.technicianSignature,
    this.customerData,
    this.equipmentData,
    this.serviceDetails,
    this.slipStatus,
    this.serviceNumber,
    this.customerName,
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['id']?.toString() ?? '',
      title: json['service_title']?.toString() ?? json['title']?.toString() ?? '',
      description: json['service_request_description']?.toString() ?? json['description']?.toString(),
      customerId: json['customer_id']?.toString(),
      priority: json['service_priority']?.toString() ?? json['priority']?.toString() ?? 'medium',
      status: json['service_status']?.toString() ?? json['status']?.toString() ?? 'new',
      assignedTo: json['assigned_technician']?.toString() ?? json['assigned_to']?.toString(),
      dueDate: _parseDateTime(json['service_due_date'] ?? json['due_date']),
      location: json['service_location']?.toString() ?? json['location']?.toString(),
      serviceType: json['service_type']?.toString(),
      equipmentId: json['equipment_id']?.toString(),
      warrantyInfo: json['warranty_info'] != null 
          ? Map<String, dynamic>.from(json['warranty_info']) 
          : null,
      attachments: _parseAttachments(json['attachments']),
      notes: _parseNotes(json['notes']),
      specialInstructions: json['special_instructions']?.toString(),
      reportedDate: _parseDateTime(json['service_reported_date'] ?? json['reported_date']),
      createdAt: _parseDateTime(json['created_at']) ?? DateTime.now(),
      updatedAt: _parseDateTime(json['updated_at']) ?? DateTime.now(),
      // Servis fişi alanları
      slipNumber: json['slip_number']?.toString(),
      issueDate: _parseDateTime(json['issue_date']),
      completionDate: _parseDateTime(json['completion_date']),
      technicianName: json['technician_name']?.toString(),
      technicianSignature: json['technician_signature']?.toString(),
      customerData: json['customer_data'] != null 
          ? Map<String, dynamic>.from(json['customer_data']) 
          : null,
      equipmentData: json['equipment_data'] != null 
          ? Map<String, dynamic>.from(json['equipment_data']) 
          : null,
      serviceDetails: json['service_details'] != null 
          ? Map<String, dynamic>.from(json['service_details']) 
          : null,
      slipStatus: json['slip_status']?.toString(),
      serviceNumber: json['service_number']?.toString(),
      customerName: json['customer_name']?.toString(),
    );
  }

  // Getter'lar
  String get serviceStatus => status;
  String get serviceTitle => title;
  String? get assignedTechnician => assignedTo;

  // Yardımcı metodlar
  static DateTime? _parseDateTime(dynamic value) {
    if (value == null) return null;
    try {
      if (value is String) {
        return DateTime.parse(value);
      }
      return null;
    } catch (e) {
      print('DateTime parse hatası: $e, value: $value');
      return null;
    }
  }

  static List<dynamic> _parseAttachments(dynamic value) {
    if (value == null) return [];
    try {
      if (value is List) {
        return List<dynamic>.from(value);
      }
      return [];
    } catch (e) {
      print('Attachments parse hatası: $e, value: $value');
      return [];
    }
  }

  static List<String>? _parseNotes(dynamic value) {
    if (value == null) return null;
    try {
      if (value is List) {
        return value.map((e) => e.toString()).toList();
      }
      return null;
    } catch (e) {
      print('Notes parse hatası: $e, value: $value');
      return null;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_title': title,
      'service_request_description': description,
      'customer_id': customerId,
      'service_priority': priority,
      'service_status': status,
      'assigned_technician': assignedTo,
      'service_due_date': dueDate?.toIso8601String(),
      'service_location': location,
      'service_type': serviceType,
      'equipment_id': equipmentId,
      'warranty_info': warrantyInfo,
      'attachments': attachments,
      'notes': notes,
      'special_instructions': specialInstructions,
      'service_reported_date': reportedDate?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      // Servis fişi alanları
      'slip_number': slipNumber,
      'issue_date': issueDate?.toIso8601String(),
      'completion_date': completionDate?.toIso8601String(),
      'technician_name': technicianName,
      'technician_signature': technicianSignature,
      'customer_data': customerData,
      'equipment_data': equipmentData,
      'service_details': serviceDetails,
      'slip_status': slipStatus,
      'service_number': serviceNumber,
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
    // Servis fişi alanları
    String? slipNumber,
    DateTime? issueDate,
    DateTime? completionDate,
    String? technicianName,
    String? technicianSignature,
    Map<String, dynamic>? customerData,
    Map<String, dynamic>? equipmentData,
    Map<String, dynamic>? serviceDetails,
    String? slipStatus,
    String? serviceNumber,
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
      // Servis fişi alanları
      slipNumber: slipNumber ?? this.slipNumber,
      issueDate: issueDate ?? this.issueDate,
      completionDate: completionDate ?? this.completionDate,
      technicianName: technicianName ?? this.technicianName,
      technicianSignature: technicianSignature ?? this.technicianSignature,
      customerData: customerData ?? this.customerData,
      equipmentData: equipmentData ?? this.equipmentData,
      serviceDetails: serviceDetails ?? this.serviceDetails,
      slipStatus: slipStatus ?? this.slipStatus,
      serviceNumber: serviceNumber ?? this.serviceNumber,
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

  // Servis fişi kontrolü
  bool get hasServiceSlip => slipNumber != null && slipNumber!.isNotEmpty;
  bool get isSlipDraft => slipStatus == 'draft';
  bool get isSlipCompleted => slipStatus == 'completed';
  bool get isSlipSigned => slipStatus == 'signed';

  // Servis fişi durum görüntüleme adı
  String get slipStatusDisplayName {
    switch (slipStatus) {
      case 'draft':
        return 'Taslak';
      case 'completed':
        return 'Tamamlandı';
      case 'signed':
        return 'İmzalandı';
      default:
        return slipStatus ?? 'Bilinmiyor';
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
