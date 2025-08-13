import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isVip?: boolean;
  lastProposal?: string;
  totalProposals?: number;
  totalValue?: number;
  industry?: string;
}

interface SmartCustomerSelectorProps {
  value?: string;
  onChange: (customerId: string) => void;
  onCustomerCreate?: (customer: Omit<Customer, 'id'>) => void;
}

const SmartCustomerSelector: React.FC<SmartCustomerSelectorProps> = ({
  value,
  onChange,
  onCustomerCreate
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        company: 'ABC Teknoloji A.Ş.',
        email: 'ahmet@abc.com',
        phone: '+90 212 555 0101',
        address: 'İstanbul',
        isVip: true,
        lastProposal: '2024-01-15',
        totalProposals: 12,
        totalValue: 450000,
        industry: 'Teknoloji'
      },
      {
        id: '2',
        name: 'Zeynep Kaya',
        company: 'XYZ İnşaat Ltd.',
        email: 'zeynep@xyz.com',
        phone: '+90 212 555 0102',
        address: 'Ankara',
        lastProposal: '2024-01-10',
        totalProposals: 8,
        totalValue: 320000,
        industry: 'İnşaat'
      },
      {
        id: '3',
        name: 'Mehmet Demir',
        company: 'DEF Otomotiv',
        email: 'mehmet@def.com',
        phone: '+90 212 555 0103',
        address: 'İzmir',
        lastProposal: '2024-01-12',
        totalProposals: 5,
        totalValue: 180000,
        industry: 'Otomotiv'
      }
    ];
    
    setAllCustomers(mockCustomers);
    setRecentCustomers(mockCustomers.slice(0, 3));
    
    if (value) {
      const customer = mockCustomers.find(c => c.id === value);
      setSelectedCustomer(customer || null);
    }
  }, [value]);

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.company?.toLowerCase().includes(search.toLowerCase()) ||
    customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onChange(customer.id);
    setOpen(false);
  };

  const getCustomerInitials = (customer: Customer) => {
    const name = customer.name || customer.company || 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Müşteri Seçimi</Label>
        
        {selectedCustomer ? (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setOpen(true)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedCustomer.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getCustomerInitials(selectedCustomer)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {selectedCustomer.name}
                    </h3>
                    {selectedCustomer.isVip && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  
                  {selectedCustomer.company && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{selectedCustomer.company}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {selectedCustomer.totalProposals && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {selectedCustomer.totalProposals} teklif
                      </span>
                    )}
                    {selectedCustomer.totalValue && (
                      <span>{formatCurrency(selectedCustomer.totalValue)}</span>
                    )}
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Değiştir
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-auto p-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>Müşteri seçin veya ara...</span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Müşteri ara..." 
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList className="max-h-[400px]">
                  <CommandEmpty>
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">
                        Aramanızla eşleşen müşteri bulunamadı
                      </p>
                      <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Yeni Müşteri Ekle
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                          </DialogHeader>
                          <NewCustomerForm 
                            onSave={(customer) => {
                              if (onCustomerCreate) {
                                onCustomerCreate(customer);
                              }
                              setNewCustomerOpen(false);
                            }}
                            onCancel={() => setNewCustomerOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CommandEmpty>
                  
                  {recentCustomers.length > 0 && !search && (
                    <CommandGroup heading="Son Kullanılan">
                      {recentCustomers.map((customer) => (
                        <CustomerItem
                          key={customer.id}
                          customer={customer}
                          onSelect={() => handleCustomerSelect(customer)}
                        />
                      ))}
                    </CommandGroup>
                  )}
                  
                  <CommandGroup heading={search ? "Arama Sonuçları" : "Tüm Müşteriler"}>
                    {filteredCustomers.map((customer) => (
                      <CustomerItem
                        key={customer.id}
                        customer={customer}
                        onSelect={() => handleCustomerSelect(customer)}
                        isSelected={value === customer.id}
                      />
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

const CustomerItem: React.FC<{
  customer: Customer;
  onSelect: () => void;
  isSelected?: boolean;
}> = ({ customer, onSelect, isSelected }) => {
  const getCustomerInitials = (customer: Customer) => {
    const name = customer.name || customer.company || 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <CommandItem
      value={`${customer.name} ${customer.company} ${customer.email}`}
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer",
        isSelected && "bg-primary/10"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={customer.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {getCustomerInitials(customer)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{customer.name}</span>
          {customer.isVip && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
              <Star className="h-2 w-2 mr-1" />
              VIP
            </Badge>
          )}
        </div>
        
        {customer.company && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{customer.company}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {customer.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{customer.email}</span>
            </span>
          )}
          {customer.lastProposal && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(customer.lastProposal).toLocaleDateString('tr-TR')}
            </span>
          )}
        </div>
      </div>
      
      {isSelected && (
        <CheckCircle className="h-4 w-4 text-primary" />
      )}
    </CommandItem>
  );
};

const NewCustomerForm: React.FC<{
  onSave: (customer: Omit<Customer, 'id'>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    industry: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      totalProposals: 0,
      totalValue: 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Ad Soyad *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Şirket</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={!formData.name.trim()}>
          Müşteri Ekle
        </Button>
      </div>
    </form>
  );
};

export default SmartCustomerSelector;