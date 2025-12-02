import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

const EnhancedTable = ({ rows, columns, heading, rowHeight = 52 }) => {
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Searching
  const filteredRows = sortedRows.filter(row =>
    columns.some(column =>
      String(row[column.field] || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="h-screen p-6">
      <Card className="w-full h-full shadow-none border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl uppercase tracking-wide">
              {heading}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-[calc(100%-120px)]">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="bg-primary sticky top-0">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead 
                      key={column.field} 
                      className="text-primary-foreground font-bold cursor-pointer"
                      onClick={() => column.sortable !== false && handleSort(column.field)}
                    >
                      <div className="flex items-center gap-1">
                        {column.headerName}
                        {column.sortable !== false && (
                          <div className="flex flex-col">
                            <ChevronUp 
                              className={`h-3 w-3 ${
                                sortField === column.field && sortDirection === "asc" 
                                  ? "text-primary-foreground" 
                                  : "text-primary-foreground/40"
                              }`} 
                            />
                            <ChevronDown 
                              className={`h-3 w-3 -mt-1 ${
                                sortField === column.field && sortDirection === "desc" 
                                  ? "text-primary-foreground" 
                                  : "text-primary-foreground/40"
                              }`} 
                            />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="hover:bg-muted/50 transition-colors"
                    style={{ height: `${rowHeight}px` }}
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={column.field}
                        className="align-middle"
                      >
                        {column.renderCell ? column.renderCell(row) : row[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} entries
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTable;