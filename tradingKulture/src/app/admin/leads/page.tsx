'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, File, X, Command, Search, User, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { useSession } from 'next-auth/react';
// import { CommandInput, CommandEmpty, CommandGroup, CommandItem } from 'cmdk';

interface User {
  _id: string;
  name?: string;
  phoneNumber?: string;
  city?: string;
  email?: string;
  state?: string;
  pincode?: string;
}

interface Lead {
  _id: string;
  name: string;
  mobileNo: string;
  email: string;
  city: string;
  platform: string;
  status: string;
  assignedTo?: User;
  createdBy?: User;
}

const UserSelectItem = ({ user }: { user: User }) => (
  <div className="flex items-center gap-2 py-2">
    <div className="h-8 w-8  rounded-full bg-primary/10 flex items-center justify-center">
      <User className="h-4 w-4 text-primary" />
    </div>
    <div className="flex flex-col ">
      <div className="font-medium ">{user.name || 'Unnamed User'}</div>
      <div className="text-xs  text-muted-foreground">
        {user.phoneNumber || 'No phone'} • {user.city || 'No city'}
      </div>
    </div>
  </div>
);

const UserCombobox = ({ users, value, onChange }: { users: User[], value: string, onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase()?.includes(query) || false;
    const phoneMatch = user.phoneNumber?.includes(searchQuery) || false;
    const cityMatch = user.city?.toLowerCase()?.includes(query) || false;
    const emailMatch = user.email?.toLowerCase()?.includes(query) || false;
    return nameMatch || phoneMatch || cityMatch || emailMatch;
  });

  const selectedUser = users.find(user => user._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full  justify-between bg-white hover:bg-muted/50"
        >
          {selectedUser ? (
            <UserSelectItem user={selectedUser} />
          ) : (
            <span className="text-muted-foreground">Select user...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 bg-white shadow-lg rounded-md border border-muted-foreground/20 z-[1000]">
        <div className="p-2 border-b border-muted-foreground/20">
          <Input 
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">No users found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="cursor-pointer p-2 hover:bg-muted/50 transition-colors"
                onClick={() => {
                  onChange(user._id);
                  setOpen(false);
                }}
              >
                <UserSelectItem user={user} />
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const LeadStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    new: "default",
    contacted: "secondary",
    successful: "outline",
    lost: "destructive"
  };

  return (
    <Badge variant={variants[status] || "default"}>
      {status}
    </Badge>
  );
};

const FileUploadZone = ({ onFileSelect, uploading }: { onFileSelect: (file: File) => void, uploading: boolean }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv' && fileType !== 'xlsx') {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-all",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          selectedFile ? "bg-muted/50" : "hover:bg-muted/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <File className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={removeFile}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag & drop your file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV and Excel files
                </p>
              </div>
            </>
          )}
          
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LeadPage = () => {

  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    city: '',
    platform: 'Facebook',
    assignedTo: '',
    createdBy: session?.user.id
  });
  const [searchQuery, setSearchQuery] = useState("");

  const platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'];
  const statuses = ['new', 'contacted', 'successful', 'lost'];

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({
          name: '',
          mobileNo: '',
          email: '',
          city: '',
          platform: 'Facebook',
          assignedTo: '',
          createdBy: session?.user.id
        });
        fetchLeads();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdate = async (leadId: string, updatedData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads?id=${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        fetchLeads(); 
      } else {
        const errorData = await response.json();
        console.error('Error updating lead:', errorData.error);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getUserDisplayName = (assignedTo: User | undefined) => {
    if (!assignedTo || !assignedTo.name) return 'Not Assigned';
    return `${assignedTo.name}${assignedTo.phoneNumber ? `, ${assignedTo.phoneNumber}` : ''}`;
  };

  const handleFileUpload = async (formData: FormData) => {
    setUploading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully uploaded ${result.count} leads`);
        fetchLeads(); // Refresh the leads list
      } else {
        const error = await response.json();
        alert(`Error uploading file: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  // Updated filterLeads function to include assignedTo in the search
  const filterLeads = (leads: Lead[], query: string) => {
    if (!query) return leads;

    const lowercaseQuery = query.toLowerCase();
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(lowercaseQuery) ||
      lead.email.toLowerCase().includes(lowercaseQuery) ||
      lead.mobileNo.includes(lowercaseQuery) ||
      lead.city.toLowerCase().includes(lowercaseQuery) ||
      lead.assignedTo?.name?.toLowerCase().includes(lowercaseQuery) ||
      lead.assignedTo?.phoneNumber?.includes(lowercaseQuery) ||
      lead.assignedTo?.email?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filteredLeads = filterLeads(leads, searchQuery);

  return (
    <div className="p-6 space-y-6  max-w-7xl mx-auto">
      <Card className="shadow-lg py-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 space-y-4">
            <Label className="text-lg font-semibold">Upload CSV/Excel File</Label>
            <FileUploadZone onFileSelect={(file) => {
              const formData = new FormData();
              formData.append('file', file);
              handleFileUpload(formData);
            }} uploading={uploading} />
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription className="text-sm">
                Upload a CSV or Excel file with columns: name, mobileNo, email, city, platform
              </AlertDescription>
            </Alert>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  placeholder="Enter mobile number"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full">
                <Label>Assign To</Label>
                <UserCombobox  
                  users={users}
                  value={formData.assignedTo}
                  onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10">
              Add Lead
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg py-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-4xl my-4 font-bold">Leads</CardTitle>
          <Input
            placeholder="Search leads..."
            className="max-w-xs my-6 h-10"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto z-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 my-4">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">City</TableHead>
                  <TableHead className="font-semibold">Platform</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                  <TableRow key={lead._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.mobileNo}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{lead.platform}</TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {getUserDisplayName(lead.assignedTo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Update</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Update Lead</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                defaultValue={lead.status}
                                onValueChange={(value) => handleUpdate(lead._id, { status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Assign To</Label>
                              <UserCombobox
                                users={users}
                                value={lead.assignedTo?._id || ''}
                                onChange={(value) => handleUpdate(lead._id, { assignedTo: value })}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No matching leads found' : 'No leads at the moment'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadPage;

